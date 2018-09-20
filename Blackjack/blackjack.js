const Deck = require('../Blackjack/deck');
const Hand = require('../Blackjack/hand');
/* Data to send to the client

visible cards form dealer!
cards from all players
whoseTurn
*/

let settings = {
    amoutOfDecks: 1,
    pullOnSoft17: false
};

class Blackjack {
    constructor(table) {
        this.cardShoe = new Deck(settings.amoutOfDecks);
        this.cardShoe.create();
        this.handDealer = new Hand();
        this.table = table;

        this.gameRuns = false;
        this.turnEnded = false;
        this.whoseTurn = [0, 0]; // seatId, hand
    }


    // starts the game
    start() {
        if (!this.gameRuns) {
            this.cardShoe.restore();
            this.cardShoe.shuffle();
            this.turnEnded = false;


            // deletes the old hand and creates a new one with the new bet!
            for (let s = 0; s < this.table.seats.length; s++) {
                if (this.table.seats[s].occupied) {
                    let bet = this.table.seats[s].hands[0].bet;
                    this.table.seats[s].restoreHands(bet);
                }
            }



            if (this.checkForReadyPlayers()) {
                this.gameRuns = true;
                this.whoseTurn = 0;
                this.handDealer = new Hand();

                // deal cards
                for (let s = 0; s < this.table.seats.length; s++) {
                    if (this.table.seats[s].hands[0].status) {
                        this.table.seats[s].hands[0].cards.push(this.cardShoe.deal());
                    }
                }
                this.handDealer.cards.push(this.cardShoe.deal());
                console.log(this.handDealer.cards[0].value);
                for (let s = 0; s < this.table.seats.length; s++) {
                    if (this.table.seats[s].hands[0].status) {
                        this.table.seats[s].hands[0].cards.push(this.cardShoe.deal());
                        this.table.seats[s].hands[0].blackjack = this.checkForBJ(this.table.seats[s].hands[0]);
                        if (this.table.seats[s].hands[0].blackjack) {
                            console.log('BJ on seat ' + s);
                        }
                        this.table.seats[s].hands[0].splitPossible = this.isSplitPossible(this.table.seats[s].hands[0]);
                        if (this.table.seats[s].hands[0].splitPossible) {
                            console.log('Split on seat ' + s);
                        }
                        console.log(this.handValue(this.table.seats[s].hands[0]));
                    }
                }

                this.handDealer.cards.push(this.cardShoe.deal());
                this.handDealer.cards[1].isVisible = false;
                this.handValue(this.handDealer);

                this.checkForNextHand(0);

            } else {
                console.log("No seats subscribed or ready, game couldn't start!");
            }
        } else {
            console.log("Game is still running");
        }

    }

    // Checks whether there are players ready to play
    checkForReadyPlayers() {


        // Check wether there is a player with a bet on the this.table
        let seatsReady = 0;
        for (let s = 0; s < this.table.seats.length; s++) {
            if (this.table.seats[s].hands[0].bet != 0) {
                seatsReady++;
                this.table.seats[s].hands[0].status = true;
            }

        }
        console.log(seatsReady + ' Seats Ready');
        return (seatsReady > 0) ? true : false;

    }

    // which player plays next? gieve Current Player @playerId, For first turn use -1
    checkForNextHand(seatId) {

        for (let s = seatId; s < this.table.seats.length; s++) { //let s = seatId + 1
            for (let h = 0; h < this.table.seats[s].hands.length; h++) {
                if (this.table.seats[s].hands[h].status & this.table.seats[s].hands[h].blackjack == false & this.table.seats[s].hands[h].doubledown == false) {
                    this.whoseTurn = [this.table.seats[s].id, h];
                    s = this.table.seats.length;
                    break;
                } else {
                    if (s == this.table.seats.length - 1) {
                        this.dealersTurn();
                    }
                }

            }
        }
    }

    checkForBJ(hand) {
        if (this.handValue(hand) == 21) {
            hand.status = false;
            return true;
        } else {
            return false;
        }
    }

    // calculates the hands value
    // What happens when the ace is drawn? <<<<<<<<<<<
    handValue(hand) {

        let hand_value = 0;
        let handToCount = hand.cards.slice();
        let aces = [];

        // filters for aces and places them in the end of @handToCount
        // makes it easier to differ between the value 1 and 11 for the ace
        for (let a = 0; a < handToCount.length; a++) {
            if (handToCount[a].value === "A") {
                aces.push(handToCount[a]);
                handToCount.splice(a, 1);

            }
        }
        handToCount.push.apply(handToCount, aces);


        // calculates the hands value and returns its value @hand_value
        for (let a = 0; a < handToCount.length; a++) {
            if (handToCount[a].isVisible == true) {
                switch (handToCount[a].value) {
                    case "J":
                        hand_value += 10;
                        break;
                    case "Q":
                        hand_value += 10;
                        break;
                    case "K":
                        hand_value += 10;
                        break;
                    case "A":
                        if (hand_value <= 10) {
                            hand_value += 11;
                            hand.soft = true;
                        } else {
                            hand_value += 1;
                            hand.soft = false;
                        }
                        break;
                    default:
                        hand_value += parseInt(handToCount[a].value);
                }
            }
        }
        hand.value = hand_value;
        return hand_value;
    }

    // adds a card to a hand | set the seat busted true when cards over 21
    hit(s) {
        if (s == this.whoseTurn[0] & this.gameRuns) {
            this.table.seats[s].hands[this.whoseTurn[1]].cards.push(this.cardShoe.deal());
            let handValue = this.handValue(this.table.seats[s].hands[this.whoseTurn[1]]);
            if (handValue > 21) {
                this.table.seats[s].hands[this.whoseTurn[1]].busted = true;
                this.table.seats[s].hands[this.whoseTurn[1]].status = false;
                if (!this.table.seats[s].hands[this.whoseTurn[1]].doubledown) {
                    this.checkForNextHand(s);
                }
            } else if (handValue == 21) {
                if (!this.table.seats[s].hands[this.whoseTurn[1]].doubledown) {
                    this.table.seats[s].hands[this.whoseTurn[1]].status = false;
                    this.checkForNextHand(s);
                    console.log("player got BJ");
                }
            }

        } else {
            console.log("not your turn!");
        }
        console.log(this.handValue(this.table.seats[s].hands[this.whoseTurn[1]]));

        //this.refresh();
    }

    stand(s) {
        if (s == this.whoseTurn[0] & this.gameRuns) {
            this.table.seats[s].hands[this.whoseTurn[1]].status = false;
            console.log('Player desided to stand!');
            this.checkForNextHand(s);
        } else {
            console.log('Not your turn!');
        }

    }

    // double down
    doubledown(s) {
        if (s == this.whoseTurn[0] & this.gameRuns) {
            if (this.table.seats[s].hands[this.whoseTurn[1]].cards.length == 2 & this.table.seats[s].player.bankBalance >= this.table.seats[s].hands[this.whoseTurn[1]].bet) {
                this.table.seats[s].hands[this.whoseTurn[1]].doubledown = true;
                this.hit(s);
                this.table.seats[s].player.bankBalance -= this.table.seats[s].hands[this.whoseTurn[1]].bet;
                // after double down your not allowed to take another card
                this.table.seats[s].hands[this.whoseTurn[1]].status = false;
                this.checkForNextHand(s);
            }
        } else {
            console.log('Not your turn!');
        }

    }

    //split in case you have two cards of the same value
    split(s) {
        if (s == this.whoseTurn[0]) {
            let handToSplit = this.table.seats[s].hands[this.whoseTurn[1]];
            if (this.isSplitPossible(handToSplit) & this.table.seats[s].player.bankBalance >= this.table.seats[s].hands[this.whoseTurn[1]].bet) {
                let newHand = new Hand();
                newHand.cards.push(handToSplit.cards[1]);
                handToSplit.cards.splice(1, 1);
                handToSplit.cards.push(this.cardShoe.deal());
                handToSplit.status = true;
                this.checkForBJ(handToSplit);
                newHand.cards.push(this.cardShoe.deal());
                newHand.status = true;
                this.checkForBJ(newHand);
                this.table.seats[s].hands.push(newHand);
                this.table.seats[s].player.bankBalance -= this.table.seats[s].hands[this.whoseTurn[1]].bet;
                this.checkForNextHand(s);
            } else {
                console.log('You cannot split');
            }

        } else {
            console.log('Not your turn!');
        }
    }

    isSplitPossible(hand) {
        if (hand.cards.length == 2) {
            return (hand.cards[0].value == hand.cards[1].value);
        } else {
            return false;
        }

    }

    // when all seats have choosen their option
    dealersTurn() {
        let handsNotBusted = 0;
        for (let s = 0; s < this.table.seats.length; s++) {
            for (let h = 0; h < this.table.seats[s].hands.length; h++) {
                if (!this.table.seats[s].hands[h].busted & this.table.seats[s].hands[h].cards.length > 0) handsNotBusted++;
            }
        }
        this.handDealer.cards[1].isVisible = true;
        if (handsNotBusted != 0) {
            while (this.handValue(this.handDealer) < 17) {
                this.handDealer.cards.push(this.cardShoe.deal());
            }
        }

        this.turnEnded = true;
        this.checkForWinner();
    }

    // who wins/ loses 
    checkForWinner() {
        let dealerValue = this.handValue(this.handDealer);
        console.log(dealerValue);


        // check for dealer bust
        if (dealerValue > 21) {
            for (let s = 0; s < this.table.seats.length; s++) {
                for (let h = 0; h < this.table.seats[s].hands.length; h++) {
                    if (this.table.seats[s].hands[h].busted != true & this.table.seats[s].occupied) {
                        //this.table.seats[s].info_field.text("Dealer BUSTS!");
                        this.payout(s, this.table.seats[s].hands[h]);
                    }
                }
            }

        } else {

            for (let s = 0; s < this.table.seats.length; s++) {
                for (let h = 0; h < this.table.seats[s].hands.length; h++) {
                    let handValue = this.handValue(this.table.seats[s].hands[h]);
                    if (this.table.seats[s].hands[h].cards.length > 0 & this.table.seats[s].occupied) {
                        // Dealer wins
                        if (dealerValue > handValue) {
                            //this.table.seats[s].info_field.text("Dealer WINS!");

                            // Player wins
                        } else if (dealerValue < handValue) {
                            if (this.table.seats[s].hands[h].busted != true) {
                                //this.table.seats[s].info_field.text("Player WINS!");
                                this.payout(s, this.table.seats[s].hands[h]);
                            } else {
                                console.log('Player busted!');
                            }

                            // Player and dealer push
                        } else {
                            //this.table.seats[s].info_field.text("PUSH!");
                            if (this.table.seats[s].hands[h].doubledown) {
                                this.table.seats[s].player.bankBalance += 2 * this.table.seats[s].hands[h].bet;
                            } else {
                                this.table.seats[s].player.bankBalance += this.table.seats[s].hands[h].bet;
                            }
                        }
                    }
                }
            }
        }
        this.end();
    }

    // pay the seats OR take their money muhahaha
    payout(s, hand) {
        if (hand.doubledown == true) {
            this.table.seats[s].player.newBalance(4 * hand.bet);
        } else {
            this.table.seats[s].player.newBalance(2 * hand.bet);
        }
    }

    // game has ended 
    end() {

        // sets the bet of the hand to 0 to be ready for a new bet
        for (let s = 0; s < this.table.seats.length; s++) {
            if (this.table.seats[s].occupied) {
                this.table.seats[s].hands[0].restore();
            }
        }
        this.gameRuns = false;

        return;
    }


    // player places his money
    setBet(s, newBet) {
        if (this.gameRuns) {
            console.log("No new Bets during the game!");
        } else {

            let addBet = Number(this.table.seats[s].hands[0].bet) + Number(newBet);
            if (addBet <= this.table.seats[s].player.bankBalance & addBet >= 0) {
                this.table.seats[s].hands[0].bet = addBet;
                this.table.seats[s].player.bankBalance -= newBet;
                console.log("Seat " + s + " placed a new Bet");

            } else {
                console.log("Seat " + s + " does not have enought money or tried to bet less than 0");
            }
        }


    }

}

module.exports = Blackjack;