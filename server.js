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

//listen on port 3000
server = app.listen(3000);

//socket.io instantiation
const io = require('socket.io')(server);
let clients = [];

//listen on every connection
io.on('connection', (client) => {

    //add new Player to the client
    clients.push(client);
    console.log('New user connected');
    client.username = "Anonymous";
    client.player = new Player(clients.username);
    console.log(clients.length);


    client.on('disconnect', () => {
        console.log('user disconnected');
        let indexOf = clients.indexOf(client);
        clients.splice(indexOf, 1);
        console.log(clients.length);
    });

    //liston on change_username
    client.on('change_username', (data) => {
        console.log('changed Username');
        client.username = data.username;
        client.player.username = data.username;

        let indexOf = clients.indexOf(client);
        console.log(clients[indexOf].player);


    });

    client.on('sit_down', (s) =>{
        console.log('player'+client.username+' sat down on seat '+s);
        table.seats[s].sitDown();
    });

    // client.on('stand_up', (s) =>{

    // });

    client.on('start_game',()=>{
        table.game.start();
        console.log(table.game.gameRuns);
    });


    





    


});