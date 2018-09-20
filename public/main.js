$(() => {
    let socket = io.connect('http://localhost:3000');

    let myPlayerId = null;

    let username_field = $("#username");
    let send_username_button = $("#send_username");

    let myUsername_field = $("#myUsername");

    let start_game_button = $("#start_game");

    let hand_dealer_value_field = $("#hand_dealer_value");

    socket.on('conInfo', (data) => {
        myPlayerId = data;
        console.log(myPlayerId);
    });

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

    start_game_button.click(() => {
        socket.emit('start_game');
    });


    socket.on('someone_stood_up', (s) => {
        $('#playerInterface' + s).empty();
        $("#seat" + s + "button").show();
    });

    socket.on('refresh', (data) => {

        sit(data);
        cardsAndValues(data);
        buttons(data);
        console.log(myPlayerId);
        console.log(data);

    });

    function sit(data) {
        for (let o = 0; o < data.seats.length; o++) {
            let s = data.seats[o].id;
            let seat = data.seats[o];
            $("#playerInterface" + s).empty();
            if (seat.occupied) {
                $("#seat" + s + "button").hide();
                let playerInterface = $('<div id="cards' + s + '"></div><p>Player Hand:<span id="hand_player_value' + s + '"><div id="infoDiv"><p>Info:<span id="info_field' + s + '"></span></p></div></div>');
                playerInterface.appendTo("#playerInterface" + s);



                if (seat.player.id == myPlayerId) {
                    let playerControls = $('<div id="controlsSeat' + s + '"></p><button id="hit' + s + '"">Hit</button><button id="stand' + s + '"">Stand</button><button id="doubledown' + s + '">2x</button><button id="split' + s + '">split</button></div><form id="nextBetForm' + s + '" onsubmit="return false"><label for="nextBet' + s + '">Next bet:</label><input type="number" id="next_bet' + s + '"><button type="submit" id="place_bet' + s + '">Add Bet</button></form><p>Balance:<span id="player_balance' + s + '"></span></p><button id="stand_up_button' + s + '">stand up</button></div>');
                    playerControls.appendTo("#playerInterface" + s);


                    // player interaction
                    hit_button = $("#hit" + s);
                    hit_button.click(() => {
                        console.log("Seat: " + s + " hit!");
                        socket.emit('hit', s);
                    });
                    stand_button = $("#stand" + s);
                    stand_button.click(() => {
                        console.log("Seat: " + s + " stand!");
                        socket.emit('stand', s);
                    });
                    doubledown_button = $("#doubledown" + s);
                    doubledown_button.click(() => {
                        console.log("Seat: " + s + " doubledown!");
                        socket.emit('doubledown', s);
                    });
                    split_button = $("#split" + s);
                    split_button.click(() => {
                        console.log("Seat: " + s + " split!");
                        socket.emit('split', s);
                    });

                    // info
                    balance_field = $("#player_balance" + s);
                    hand_player_value = $("#hand_player_value" + s);
                    info_field = $("#info_field" + s);

                    // leave table
                    stand_up_button = $("#stand_up_button" + s);
                    stand_up_button.click(() => {
                        socket.emit('stand_up', s);
                    });

                    // next Bet Form
                    next_bet_field = $("#next_bet" + s);
                    next_bet_button = $("#place_bet" + s);
                    next_bet_button.click(() => {
                        console.log("nextBet on seat: " + s + ' is ' + next_bet_field.val());
                        socket.emit('place_bet', {
                            seatId: s,
                            bet: next_bet_field.val()
                        });
                    });

                }

            }
        }
    }

    function cardsAndValues(data) {

        // this.createPlayerForm.prop("disabled", true);
        //start_game_button.hide();
        hand_dealer_value_field.text(data.handDealer.value); //shows dealer hand value
        $('#cardsDealer').empty();

        for (let s = 0; s < data.seats.lenght; s++) {
            if (data.seats[s].occupied) {
                $('#cards' + s).empty();
            }
        }

        //  shows Dealerscards , in the beginning only show firstCard
        if (data.handDealer.cards.length >= 2) {
            for (let img = 0; img < data.handDealer.cards.length; img++) {
                if (data.handDealer.cards[img].isVisible == false) {
                    $('#cardsDealer').append(' <img  id="card' + img + 'dealer" src="transparent.png">'); // needs transparent picture, without it background property can't be used.
                    $('#card' + img + '' + "dealer").css('background', 'url(cards.png)' + -158 + 'px ' + -492 + 'px');
                } else {
                    $('#cardsDealer').append(' <img  id="card' + img + 'dealer" src="transparent.png">');
                    $('#card' + img + '' + "dealer").css('background', 'url(cards.png)' + data.handDealer.cards[img].left + 'px ' + data.handDealer.cards[img].top + 'px');

                }
            }
        }

        // shows Playercards and Value
        for (let s = 0; s < data.seats.length; s++) {
            $('#cards' + s).empty();

            for (let h = 0; h < data.seats[s].hands.length; h++) {
                if (data.seats[s].occupied & data.seats[s].hands[h].cards.length > 0) {


                    if (data.seats[s].hands[h].soft & data.seats[s].hands[h].value != 21 & data.seats[s].hands[h].status) {
                        $("#hand_player_value" + s).text(data.seats[s].hands[h].value - 10 + '/' + data.seats[s].hands[h].value);

                    } else {
                        $("#hand_player_value" + s).text(data.seats[s].hands[h].value);

                    }

                    $('#cards' + s).append('<div class="hand" id="hand' + s + '' + h + '"></div>');
                    for (let img = 0; img < data.seats[s].hands[h].cards.length; img++) {
                        $('#hand' + s + '' + h).append(' <img  id="card' + img + '' + h + '" src="transparent.png">');
                        $('#card' + img + '' + h).css('background', 'url(cards.png)' + data.seats[s].hands[h].cards[img].left + 'px ' + data.seats[s].hands[h].cards[img].top + 'px');
                    }
                } else {
                    //data.seats[s].hand_player_value.text("No bet received!");
                }
            }
        }


    }

    function buttons(data) {
        if (data.gameRuns) {
            start_game_button.hide();
            $("#hand" + data.seats[data.whoseTurn[0]].id + '' + data.whoseTurn[1]).addClass('activeHand');

        } else {
            start_game_button.show();
            $(".hand").removeClass('activeHand');
        }
    }




});