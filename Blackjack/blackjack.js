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

        //this.deal_cards_button = $("#deal_cards");
        //this.hand_dealer_value = $("#hand_dealer_value");
        //this.refresh();
    }


    // starts the game
    start() {
        if (!this.gameRuns) {
            this.cardShoe.restore();
            this.cardShoe.shuffle();
            this.turnEnded = false;



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

                //this.refresh();
            } else {
                console.log("No seats subscribed or ready, game couldn't start!");
            }
        } else {
            console.log("Game is still running");
        }

    }

    // Checks whether there are players ready to play
    checkForReadyPlayers() {
        
        for (let s = 0; s < this.table.seats.length; s++) {
            console.log(this.table.seats[s].occupied);
            if (this.table.seats[s].occupied) {
                this.table.seats[s].hands[0].restore();

            }
        }

        // Check wether there is a player with a bet on the this.table
        let seatsReady = 0;
        for (let s = 0; s < this.table.seats.length; s++) {
            if (this.table.seats[s].hands[0].bet != 0) {
                seatsReady++;
                this.table.seats[s].hands[0].status = true;
            }

        }
        console.log(seatsReady+' Seats Ready');
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
        // if the same player needs to go another turn --> Dealers turn
        // if (seatId == this.whoseTurn[0]) {
        //     this.dealersTurn();
        // }
        //this.refresh();


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

        //this.refresh();
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
                //this.refresh();
            }
        }

        this.turnEnded = true;
        this.checkForWinner();
       // this.refresh();
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
        //this.refresh();
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
        for (let s = 0; s < this.table.seats.length; s++) {
            if (this.table.seats[s].occupied) {
                this.table.seats[s].restoreHands();
            }
        }
        this.gameRuns = false;
        //this.refresh();
        return;
    }


    // player places his money
    setBet(seatId) {
        if (this.gameRuns) {
            console.log("No new Bets during the game!");
        } else {
            //const lastBalance = this.table.seats[p].balance;
            let newBet = $("#nextBet" + seatId).val();
            let addBet = Number(this.table.seats[seatId].hands[0].bet) + Number(newBet);
            if (addBet <= this.table.seats[seatId].player.bankBalance & addBet >= 0) {
                this.table.seats[seatId].hands[0].bet = addBet;
                this.table.seats[seatId].player.bankBalance -= newBet;
                console.log("Seat " + seatId + " placed a new Bet");
            } else {
                console.log("Seat " + seatId + " does not have enought money or tried to bet less than 0");
            }
        }

        //this.refresh();
    }

    /*
    refresh() {

        // show bank balance of every player at the table
        for (let s = 0; s < this.table.seats.length; s++) {
            if (this.table.seats[s].occupied) {
                this.table.seats[s].balance_field.text(this.table.seats[s].player.bankBalance);

            }
        }

        // game is in progress
        if (this.gameRuns) {
            // this.createPlayerForm.prop("disabled", true);
            this.deal_cards_button.hide();
            this.hand_dealer_value.text(this.handDealer.value); //shows dealer hand value
            $('#cardsDealer').empty();

            for (let s = 0; s < this.table.seats.length; s++) {
                if (this.table.seats[s].occupied) {
                    $('#cards' + s).empty();
                }
            }

            //  shows Dealerscards , in the beginning only show firstCard
            if (this.handDealer.cards.length >= 2) {
                for (let img = 0; img < this.handDealer.cards.length; img++) {
                    if (this.handDealer.cards[img].isVisible == false) {
                        $('#cardsDealer').append(' <img  id="card' + img + 'dealer" src="transparent.png">'); // needs transparent picture, without it background property can't be used.
                        $('#card' + img + '' + "dealer").css('background', 'url(cards.png)' + -158 + 'px ' + -492 + 'px');
                    } else {
                        $('#cardsDealer').append(' <img  id="card' + img + 'dealer" src="transparent.png">');
                        $('#card' + img + '' + "dealer").css('background', 'url(cards.png)' + this.handDealer.cards[img].left + 'px ' + this.handDealer.cards[img].top + 'px');

                    }
                }
            }

            // shows Playercards and Value
            for (let s = 0; s < this.table.seats.length; s++) {
                $('#cards' + s).empty();
                
                for (let h = 0; h < this.table.seats[s].hands.length; h++) {
                    if (this.table.seats[s].occupied & this.table.seats[s].hands[h].cards.length > 0) {

                      
                            if (this.table.seats[s].hands[h].soft & this.table.seats[s].hands[h].value != 21 & this.table.seats[s].hands[h].status) {
                                this.table.seats[s].hand_player_value.text(this.table.seats[s].hands[h].value - 10 + '/' + this.table.seats[s].hands[h].value);
                                
                            } else {
                                this.table.seats[s].hand_player_value.text(this.table.seats[s].hands[h].value);
                                
                            }
                        
                        $('#cards' + s).append('<div class="hand" id="hand' + s + '' + h + '"></div>');
                        for (let img = 0; img < this.table.seats[s].hands[h].cards.length; img++) {
                            $('#hand' + s + '' + h).append(' <img  id="card' + img + '' + h + '" src="transparent.png">');
                            $('#card' + img + '' + h).css('background', 'url(cards.png)' + this.table.seats[s].hands[h].cards[img].left + 'px ' + this.table.seats[s].hands[h].cards[img].top + 'px');
                        }
                    } else {
                        //this.table.seats[s].hand_player_value.text("No bet received!");
                    }
                }
            }

            // depending on @whoseTurn enable/disable buttons
            // show info if player already busted
            for (let s = 0; s < this.table.seats.length; s++) {

                //sets all buttons and notifications for people no on turn
                if (this.table.seats[s].occupied) {
                    if (this.table.seats[s].id != this.whoseTurn[0]) {
                        //$(".hand").removeClass('activeHand');
                        //$("#hand" + s + '' + this.whoseTurn[1]).addClass('activeHand');
                        this.table.seats[s].hit_button.prop("disabled", true);
                        this.table.seats[s].stand_button.prop("disabled", true);
                        this.table.seats[s].doubledown_button.prop("disabled", true);
                        this.table.seats[s].split_button.prop("disabled", true);
                        // if (this.table.seats[s].hand > 21) {
                        //     this.table.seats[s].infoField.text("Player BUSTS!");
                        // } else if (this.table.seats[s].blackjack) {
                        //     this.table.seats[s].infoField.text("BLACKJACK");
                        // }

                    } else {
                        // set all buttons and notification for the player on turn
                        $(".hand").removeClass('activeHand');
                        $("#hand" + s + '' + this.whoseTurn[1]).addClass('activeHand');
                        this.table.seats[s].hit_button.prop("disabled", false);
                        this.table.seats[s].stand_button.prop("disabled", false);
                        if (this.table.seats[s].hands[this.whoseTurn[1]].cards.length == 2) {
                            this.table.seats[s].doubledown_button.prop("disabled", false);
                        } else {
                            this.table.seats[s].doubledown_button.prop("disabled", true);
                        }
                        if (this.isSplitPossible(this.table.seats[s].hands[this.whoseTurn[1]])) {
                            this.table.seats[s].split_button.prop("disabled", false);
                        } else {
                            this.table.seats[s].split_button.prop("disabled", true);
                        }
                        // if (playerValues[s] > 21) {
                        //     this.table.seats[s].infoField.text("Player BUSTS!");
                        // } else if (this.table.seats[s].blackjack) {
                        //     this.table.seats[s].infoField.text("BLACKJACK");
                        // }
                    }

                    // If the turn ends disable buttons for the last player and check for winners
                    if (this.turnEnded) {
                        $(".hand").removeClass('activeHand');
                        this.table.seats[this.whoseTurn[0]].hit_button.prop("disabled", true);
                        this.table.seats[this.whoseTurn[0]].stand_button.prop("disabled", true);
                        this.table.seats[this.whoseTurn[0]].doubledown_button.prop("disabled", true);
                        this.table.seats[this.whoseTurn[0]].split_button.prop("disabled", true);
                    }
                }
            }

            // game is not in progress disable buttons
        } else {
            //this.createPlayerForm.prop("disabled", false);
            this.deal_cards_button.show();
            for (let s = 0; s < this.table.seats.length; s++) {
                if (this.table.seats[s].occupied) {
                    $(".hand").removeClass('activeHand');
                    this.table.seats[s].balance_field.text(this.table.seats[s].player.bankBalance);
                    this.table.seats[s].hit_button.prop("disabled", true);
                    this.table.seats[s].stand_button.prop("disabled", true);
                    this.table.seats[s].doubledown_button.prop("disabled", true);
                }
            }
        }

    }*/
}

module.exports = Blackjack;