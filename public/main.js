$(() => {
    let socket = io.connect('http://localhost:3000');


    let username_field = $("#username");
    let send_username_button = $("#send_username");

    let myUsername_field = $("#myUsername");

    let start_game_button = $("#start_game");


    send_username_button.click(() => {

        socket.emit('change_username', {
            username: username_field.val()
        });
        myUsername_field.text(username_field.val());
        console.log(username_field.val());
    });

    for (let s = 0; s < 6; s++) {
        $("#seat" + s + "button").click(sitDown(s));
    }

    function sitDown(s) {    
        return function () {
            socket.emit('sit_down', s);            
            console.log(s);
        };
    }

    start_game_button.click(()=>{
        socket.emit('start_game');
    });

});

