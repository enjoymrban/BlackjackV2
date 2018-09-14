/* Data to send to the client

visible cards form dealer!
cards from all players
whoseTurn
*/

let settings = {
    amoutOfDecks: 1,
    pullOnSoft17: false
}

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
        this.card_shoe.restore();
        this.card_shoe.shuffle();
        this.turn_ended = false;



        if (this.checkForReadyPlayers) {
            this.game_runs = true;
            this.whoseTurn = 0;
            this.hand_dealer.cards = [];
            for (let s = 0; s < firstTable.seats.length; s++) {

                this.seats[s].hands = [];
                this.seats[s].doubledown = false;
                this.seats[s].blackjack = false;
                this.seats[s].busted = false;
                if (this.seats[s].occupied) {
                    this.seats[s].infoField.text("");
                }

                this.checkForNextPlayer(-1);

                if (s == this.whoseTurn) {
                    this.seats[s].hit_button.prop("disabled", false);
                    this.seats[s].stand_button.prop("disabled", false);
                }

            }



            // deal cards
            for (let s = 0; s < this.seats.length; s++) {
                if (this.seats[s].status) {
                    this.seats[s].hands.push(this.card_shoe.deal());
                }
            }
            this.hand_dealer.cards.push(this.card_shoe.deal());
            for (let s = 0; s < this.seats.length; s++) {
                if (this.seats[s].status) {
                    this.seats[s].hands.push(this.card_shoe.deal());
                    this.seats[s].blackjack = this.checkForBJ(this.seats[s].hands);
                }
            }
            this.hand_dealer.cards.push(this.card_shoe.deal());
            this.hand_dealer.cards[1].isVisible = false;

            this.refresh();
        } else {
            console.log("No seats subscribed or ready, game couldn't start!");
        }

    }

    checkForReadyPlayers() {
        for (let p = 0; p < firstTable.seats.length; p++) {
            if (this.firstTable.seats[p].occupied) {
                this.firstTable.seats[p].hands = [new Hand()];

            }

        }

        // Check wether there is a player with a bet on the table
        let seats_ready = 0;
        for (let s = 0; s < this.seats.length; s++) {
            if (this.seats[s].hands[0].bet != 0) {
                seats_ready++;
                this.seats[s].hands[0].status = true;
            }

        }

        return (seats_ready>0)?true:false;

    }

    restore(){
        
    }
}

