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
    constructor() {
        this.cardShoe = new Deck(settings.amoutOfDecks);
        this.cardShoe.create();
        this.handDealer = new Hand();

        this.gameRuns = false;
        this.turnEnded = false;
        this.whoseTurn = 0;

        this.deal_cards_button = $("#deal_cards");
        this.hand_dealer_value = $("#hand_dealer_value");
        //this.refresh();
    }


    // starts the game
    start() {
        this.cardShoe.restore();
        this.cardShoe.shuffle();
        this.turn_ended = false;



        if (this.checkForReadyPlayers()) {
            this.gameRuns = true;
            this.whoseTurn = 0;
            this.handDealer = new Hand();

            this.checkForNextHand(-1);



            // deal cards
            for (let s = 0; s < firstTable.seats.length; s++) {
                if (firstTable.seats[s].hands[0].status) {
                    firstTable.seats[s].hands[0].push(this.cardShoe.deal());
                }
            }
            this.handDealer.cards.push(this.cardShoe.deal());
            for (let s = 0; s < this.seats.length; s++) {
                if (firstTable.seats[s].hands[0].status) {
                    firstTable.seats[s].hands[0].push(this.cardShoe.deal());
                    firstTable.seats[s].hands[0].blackjack = this.checkForBJ(this.seats[s].hands);
                }
            }
            this.handDealer.cards.push(this.cardShoe.deal());
            this.handDealer.cards[1].isVisible = false;

            //this.refresh();
        } else {
            console.log("No seats subscribed or ready, game couldn't start!");
        }

    }

    checkForReadyPlayers() {
        for (let s = 0; s < firstTable.seats.length; s++) {
            if (firstTable.seats[s].occupied) {
                firstTable.seats[s].hands[0].restore();

            }

        }

        // Check wether there is a player with a bet on the table
        let seatsReady = 0;
        for (let s = 0; s < firstTable.seats.length; s++) {
            if (firstTable.seats[s].hands[0].bet != 0) {
                seatsReady++;
                firstTable.seats[s].hands[0].status = true;
            }

        }

        return (seatsReady > 0) ? true : false;

    }

    // which player plays next? gieve Current Player @playerId, For first turn use -1
    checkForNextHand(seatId) {

        for (let s = seatId + 1; s < this.seats.length; s++) {
            if (this.seats[s].status & this.seats[s].blackjack == false) {
                this.whoseTurn = this.seats[s].id;
                break;
            } else {
                if (s == this.seats.length - 1) {
                    this.dealersTurn();
                }
            }
        }
        // if the same player needs to go another turn --> Dealers turn
        if (seatId == this.whoseTurn) {
            this.dealersTurn();
        }
        this.refresh();


    }

    // player places his money
    setBet(seatId) {
        if (this.gameRuns) {
            console.log("No new Bets during the game!");
        } else {
            //const lastBalance = firstTable.seats[p].balance;
            let newBet = $("#nextBet" + seatId).val();
            let addBet = Number(firstTable.seats[seatId].hands[0].bet) + Number(newBet);
            if (addBet <= firstTable.seats[seatId].player.bankBalance & addBet >= 0) {
                firstTable.seats[seatId].hands[0].bet = addBet;
                firstTable.seats[seatId].player.bankBalance -= newBet;
                console.log("Seat " + seatId + " placed a new Bet");
            } else {
                console.log("Seat " + seatId + " does not have enought money or tried to bet less than 0");
            }
        }

        //this.refresh();
    }
}