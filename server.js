const express = require('express');
const app = express();
const Player = require('./Blackjack/player');
const Table = require('./Blackjack/table');


let table = new Table();

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


    // client.on("join", function(name){
    // 	people[client.id] = name;
    // 	client.emit("update", "You have connected to the server.");
    // 	socket.sockets.emit("update", name + " has joined the server.")
    // 	socket.sockets.emit("update-people", people);
    // });







    // //listen on new_messages
    // socket.on('new_message', (data) => {
    //     IO.sockets.emit('new_message', { message: data.message, username: socket.username});
    // });

    //   //listen on typing
    //   socket.on('typing', (data) =>{
    //     socket.broadcast.emit('typing', {username: socket.username});
    // });


});