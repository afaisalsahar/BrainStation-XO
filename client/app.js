let gameMode = "";
let playerOne = "";
let playerTwo = "";
let activePlayer = playerOne;
let firstPlayer = playerTwo;
let disablePlayerInteraction = false;

let gameLevel = 0;            
let gameBoard = [0,1,2,3,4,5,6,7,8];
let boardCM = [0,2,4,6,8];
let boardRL = [];

let gameStats = {c: 0, t: 0, d: 0};
            
let masterMove = "";
let noviceMove = "";


// multiplayer setup
const socket = io();
let activeRoom = null;
let activeGame = null;
let activePlayerNumber = null;

// highlight player
function indicatorPlayer() {
    $(".game__indicator .game__icon")
        .removeClass("game__icon--active-times game__icon--active-circle");

    if (activePlayerNumber === 2) {
        $(".game__indicator .game__icon--circle")
            .addClass("game__icon--active-circle");
    } else {
        $(".game__indicator .game__icon--times")
            .addClass("game__icon--active-times");
    }
}

function cellIcon() {
    return (activePlayerNumber === 2) ? "fa fa-circle-o" : "fa-solid fa-xmark";
}

// handle player hover event
function hanlePlayerHover(cell, mode) {
    if (disablePlayerInteraction) return;

    if (cell.dataset.checked === "false") {
        const classNames = "game__cell--hover animate__animated animate__fadeIn";
        if (mode) {
            $(cell).addClass(classNames);
            $(cell.children[0]).removeClass().addClass(cellIcon());
        } else {
            $(cell).removeClass(classNames);
            $(cell.children[0]).removeClass("fa" + cellIcon());
        }
    }
}

// handle player moves
function handlePlayerMove(cell, value) {
    if (disablePlayerInteraction) return;

    const cellCheck = cell.dataset;
    if (cellCheck.checked === "true") return;

    cellCheck.checked = "true";

    $(cell).removeClass("game__cell--hover animate__animated animate__fadeIn");
    $(cell).addClass(activePlayerNumber === 2 ? "game__cell--circle animate__animated animate__bounceIn" : "game__cell--times animate__animated animate__bounceIn");
    $(cell.children[0])
        .removeClass()
        .addClass(value === "X" ? "fa-solid fa-xmark" : "fa fa-circle-o");
}

// hanlde game results
function handleGameResult(pattern) { 
    for (let cell of pattern) {
        const winPattern = cell[0] * 3 + cell[1];
        $($(`#${winPattern}`)[0])
            .removeClass()
            .addClass('game__cell game__cell--won animate__animated animate__bounceOut')
    }
}

// hanlde game updates 
function updateGame(gameState) {
    console.log("update Game: ", gameState);

    if (!gameState) {
        activeGame = null;
        activeRoom = null;
        activePlayerNumber = null;
    }
    else {
        activeGame = gameState;
        
        if (!activeGame.gameState) return;
        
        activePlayerNumber = activeGame.activePlayer;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const value = activeGame.gameState[i][j];

                if (value === " ") continue;

                const parentID = i * 3 + j;

                handlePlayerMove($(`#${parentID}`)[0], value);
            }

            if (activeGame.gameOver && activeGame.winCombinations) {
                handleGameResult(activeGame.winCombinations);
            }
        }
    }

    indicatorPlayer();
}

// game play
$(".game__cell").on("click", function(e) {
    if (!activeGame || activeGame.gameOver) return;
    const playRoom = activeRoom;
    const cellId = Number(this.id);

    socket.emit(
        "playMove",
        playRoom,
        [Math.floor(cellId / 3), cellId % 3],
        (success) => {
            if (!success) {
                console.log("Not able to play move");
            } else {
                console.log("Move played Successfully");
                indicatorPlayer();
            }
        }
    )
});

// multiplayer setup
socket.on("update", (gameState) => {
    updateGame(gameState);
});

socket.on("terminated", () => {updateGame(null)});

// multiplayer join request
$("#join-game").on("submit", function(e) {
    e.preventDefault();

    // quick and simple validation
    // TODO: style invalid form fields accordingly
    
    const playerName = $("#join-name").val().trim();
    const playRoom = $("#join-room").val().trim();
    if (!playerName && !playRoom) return;

    socket.emit("joinGame", playRoom, playerName, (joinSuccess, playerNumber) => {
        if(!joinSuccess) {
            console.log('!!Error: Not able to create/join game');
            return;
        }
        
        activeRoom = playRoom;
        activePlayerNumber = playerNumber;
    });

    // reset join form
    this.reset();
    
    // hide join screen
    $(".join")
    .fadeOut(300, function() {
        // show game board
        $(".game")
            .fadeIn()
            .css("display", "flex");
    });
    
    indicatorPlayer();
});

// show player marker
$(".game__cell").on("mouseenter", function(_e) {
    hanlePlayerHover(this, 1);
}).on("mouseleave", function(_e) {
    hanlePlayerHover(this, 0);
});

// choose game mode
$(".mode__type").on("click", function(_e) {
    if (!this.dataset.mode) return;

    gameMode = this.dataset.mode;
    $(".mode")
        .fadeOut(300, function() {
            if(gameMode === 'single') {
                $(".side")
                    .fadeIn()
                    .css("display", "flex");
            } else {
                $(".join")
                    .fadeIn()
                    .css("display", "flex");
            }
    });
});

// choose marker / circle or times
$(".side__icon").on("click", function(_e) {

    if (this.dataset.side) {
        playerOne = this.dataset.side;
        activePlayer = playerOne;
        firstPlayer = playerOne;
    }

    playerTwo = (playerOne === 'circle') ? 'times' : 'circle';

    if (gameMode === "single") {
            $(".level")
                .addClass(playerOne === "circle" ? "level--circle" : "level--times");
    
            $(playerOne === "circle" ? ".level__icon--circle" : ".level__icon--times")
                .css("display", "block");
        }
    
        $(".side")
            .fadeOut(300, function() {
                if (gameMode === "single") {
                    $(".level")
                        .fadeIn()
                        .css("display", "flex");
                } else {
                    $(".game").fadeIn().css("display", "flex");
                }
        });
});

// single player / pick difficulty level
$(".level__size").on("click", function(e) {
    if (!this.dataset.level) return false;

    gameLevel = parseInt(this.dataset.level);

    $(".level")
        .fadeOut(300, function() {
            $(".level")
                .removeClass()
                .addClass("level");

            $(".level__icon")
                .css("display", "none");

        $(".game")
            .fadeIn()
            .css("display", "flex");
    });

    indicatorPlayer();
});