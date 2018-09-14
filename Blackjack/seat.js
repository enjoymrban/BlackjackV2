let seat_id = 0;

class Seat{
    constructor(){
        this.id = seat_id;
        seat_id++;
        this.player = null; 
        this.hands = [];
        this.hands.push(new Hand());
        this.occupied = false;
        this.readyToPlay = false;
        this.hit_button = null;
        this.stand_button = null;
        this.doubledown_button = null;
        this.hand_player_value = null;
        this.info_field = null;
        this.balance_field = null;
    }

    sitDown(player){
        this.player = new Player("Hans", 200);  // normaly player
        this.occupied = true;
        let playerInterface = $('<div id="cards' + this.id + '"></div><p>Player Hand:<span id="hand_player_value' + this.id + '"></span><div id="controlsSeat' + this.id + '"></p><button id="hit' + this.id + '" onclick="firstTable.game.hit(' + this.id + ')">Hit</button><button id="stand' + this.id + '" onclick="firstTable.game.stand(' + this.id + ')">Stand</button><button id="doubledown' + this.id + '" onclick="firstTable.game.doubledown(' + this.id + ')">2x</button></div><form id="nextBetForm' + this.id + '" onsubmit="return false"><label for="nextBet' + this.id + '">Next bet:</label><input type="number" id="nextBet' + this.id + '"><button type="submit" id="place_bet' + this.id + '"onclick="firstTable.game.setBet(' + this.id + ')">Add Bet</button></form><div id="infoDiv"><p>Info:<span id="info_field' + this.id + '"></span></p><p>Balance:<span id="player_balance' + this.id + '"></span></p><button id="leave_table_button'+this.id+'" onclick="firstTable.seats['+this.id+'].standUp()">stand up</button></div>');
        playerInterface.appendTo("#seat" + this.id);

        
        this.hit_button = $("#hit" + this.id);
        this.stand_button = $("#stand" + this.id);
        this.doubledown_button = $("#doubledown" + this.id);
        this.balance_field = $("#player_balance" + this.id);
        this.hand_player_value = $("#hand_player_value" + this.id);
        this.info_field = $("#info_field" + this.id);

        $("#seat" + this.id + "button").hide();
        
    }

    standUp(){
        $('#seat' + this.id).empty();
        $("#seat" + this.id + "button").show();
        console.log("Player from seat: "+ this.id +" left.");
        
    }
}