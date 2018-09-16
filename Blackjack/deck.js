const Card = require('../Blackjack/card');
//A Deck 
class Deck {

    //@amountOfDecks: how many Decks with 52 Cards this DECK should contain
    constructor(amoutOfDecks) {
        this.deck = [];
        this.dealtCards = [];
        this.amoutOfDecks = amoutOfDecks;
        
    }

    // Creates an Deck with a specific @amoutOfDecks
    create() {
        const VALUES = ['A','2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const SUITS = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
        let left = 947;
        let top = 0;

        for (let a = 0; a < this.amoutOfDecks; a++) {
            top = 0;
            for (let s = 0; s < SUITS.length; s++) {
                left = 0;
                for (let v = 0; v < VALUES.length; v++) {
                    this.deck.push(new Card(SUITS[s], VALUES[v], left, top));
                    left -=79; 
                }
                top -=123;
                
            }
                      
        }
    }

    print() {
        if (this.deck.length == 0) {
            console.log("This Deck is empty");
        } else {
            for (let c = 0; c < this.deck.length; c++) {
                console.log(this.deck[c].name);
            }
        }
    }

    //Shuffles the Deck with the Fisher-Yates Algorithm
    //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shuffle() {

        var currentIndex = this.deck.length,
            temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this.deck[currentIndex];
            this.deck[currentIndex] = this.deck[randomIndex];
            this.deck[randomIndex] = temporaryValue;
        }
    }

    // Deals one card
    deal() {
        let dealt_card = this.deck.shift();
        this.dealtCards.push(dealt_card);

        return dealt_card;
    }

    // Adds all cards from @dealtCards back to the @deck and ampties the @dealtCards
    restore(){    
        this.deck.push.apply(this.deck, this.dealtCards);
        this.dealtCards = [];
    }

}

module.exports=Deck;
