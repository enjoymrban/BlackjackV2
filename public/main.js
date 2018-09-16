$(()=>{
    let socket = io.connect('http://localhost:3000');

  
    let username_field = $("#username");    
    let send_username_button = $("#send_username");

    let myUsername_field = $("#myUsername");


    send_username_button.click(()=>{
        
        socket.emit('change_username', {username: username_field.val()});
        myUsername_field.text(myUsername_field.val());
        console.log(username_field.val());
    });
    
});