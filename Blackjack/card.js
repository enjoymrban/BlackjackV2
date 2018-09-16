// A Card
class Card {
    constructor(suit, value, left, top) {
        this.name = value + " of " + suit;
        this.suit = suit;
        this.value = value;
        this.isVisible = true;
        this.left = left;
        this.top = top;
        this.width = "78px";
        this.height = "122px";

    }

}

module.exports = Card;