let player_id = 0;

class Player{
    constructor(username){
        this.id = player_id;
        player_id++;
        this.username = username;
        this.bankBalance = 200;
    }

    newBalance(win){
        this.bankBalance += win;
    }
}

module.exports = Player;

