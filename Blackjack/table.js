let table_id = 0;

class Table{
    constructor(){
    this.id = table_id;
    table_id++;
    this.name = "Blackjack";
    this.seats = []; 
    this.addSeats();
    this.game = new Blackjack(this);
    
    }


    addSeats(){
        for (let sid = 0; sid < 6; sid++) {
            let seat = new Seat(sid);
            this.seats.push(seat);
        }
    }
}