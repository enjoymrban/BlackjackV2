const express = require('express');
const app = express();
const Player = require('./Blackjack/player');
const Table = require('./Blackjack/table');


let table = new Table();
//console.log(table);


//set the template engine ejs
app.set('view engine', 'ejs');

//middlewares
app.use(express.static('public'));

//routes
app.get('/', (req, res) => {
    res.render('index');
});

//routes
app.get('/blackjack', (req, res) => {
    res.render('blackjack');
});
//listen on port 3000
server = app.listen(3000);

//socket.io instantiation
const io = require('socket.io')(server);
let clients = [];

//listen on every connection
io.on('connection', (client) => {

    //add new Player to the client
    clients.push(client);
    client.username = "Anonymous";
    client.player = new Player(client.username);
    console.log('New user connected. Now: ' + clients.length + ' clients connected');
    refresh();
    client.emit('conInfo', client.player.id);

    client.on('disconnect', () => {
        let indexOf = clients.indexOf(client);
        clients.splice(indexOf, 1);
        console.log('user disconnected. Now ' + clients.length + ' clients connected');
    });

    //liston on change_username
    client.on('change_username', (data) => {
        console.log('changed Username');
        client.username = data.username;
        client.player.username = data.username;

        let indexOf = clients.indexOf(client);
        refresh();
        console.log(clients[indexOf].player);


    });

    // sit down
    client.on('sit_down', (s) => {
        console.log('Player ' + client.username + ' sat down on seat:  ' + s);
        table.seats[s].sitDown(client.player);
        refresh();
        //io.sockets.emit('someone_sat_down', { seatId: s });

        //client.emit('i_sat_down', { seatId: s, success: true });
    });

    client.on('stand_up', (s) => {
        console.log('Player ' + client.username + ' stood up from seat: ' + s);
        if (table.seats[s].standUp()) {
            refresh();
            io.sockets.emit('someone_stood_up', s);
        }
    });

    client.on('place_bet', (data) => {
        table.game.setBet(data.seatId, data.bet);
    });


    // start the game
    client.on('start_game', () => {
        table.game.start();
        refresh();
        //console.log(table.game.gameRuns);
    });


    // hit
    client.on('hit', (s) => {
        table.game.hit(s);
        refresh();

    });

    // stand
    client.on('stand', (s) => {
        table.game.stand(s);
        refresh();

    });

    // doubledown
    client.on('doubledown', (s) => {
        table.game.doubledown(s);
        refresh();
    });

    // split
    client.on('split', (s) => {
        table.game.split(s);
        refresh();
    });




    function refresh() {


        
        let seatsToSend = JSON.parse(JSON.stringify(table.seats));
        for (let s = 0; s < table.seats.length; s++) {
            if (seatsToSend[s].player != null & seatsToSend[s].player != undefined) {
               delete seatsToSend[s].player.bankBalance;
            }
        }
        let dataForClient = {
            gameRuns: table.game.gameRuns,
            whoseTurn: table.game.whoseTurn,
            handDealer: table.game.handDealer,
            seats: seatsToSend
            

        };
        console.log("refresh client " + dataForClient);
        //console.log(clients);
        io.sockets.emit('refresh', dataForClient);
    }







});

