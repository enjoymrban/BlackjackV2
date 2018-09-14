class Hand{
    constructor(){
        this.cards = [];
        this.bet = 0;
        this.soft = false;
        this.doubledown = false;
        this.busted = false;   
        this.status = false;     
        
    }

    restore(){
        this.cards = [];
        this.soft = false;
        this.doubledown = false;
        this.busted = false;
        this.status = false;
    }
}