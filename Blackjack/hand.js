class Hand {
    constructor() {
        this.cards = [];
        this.bet = 0;
        this.soft = false;
        this.doubledown = false;
        this.blackjack = false;
        this.busted = false;
        this.status = false;
        this.splitPossible = false;
        this.value = 0;

    }

    restore() {
        this.cards = [];
        this.soft = false;
        this.doubledown = false;
        this.blackjack = false;
        this.busted = false;
        this.status = false;
        this.splitPossible = false;
        this.value = 0;

    }

    retoreBet() {
        this.bet = 0;
    }
}

module.exports = Hand;