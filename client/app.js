let gameMode = "";

// singleplayer setup
let player = "";
let ai = "";
let activePlayer = player;
let firstPlayer = player;
let disablePlayerInteraction = false;

let aiLevel = 0;            
let gameBoard = [0,1,2,3,4,5,6,7,8];
let boardCM = [0,2,4,6,8];
let boardRL = [];

let gameStandings = {
    circle: 0,
    times: 0,
    draw: 0
};
                
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

    if (activePlayer === "circle" || activePlayerNumber === 2) {
        $(".game__indicator .game__icon--circle")
            .addClass("game__icon--active-circle");
    } else {
        $(".game__indicator .game__icon--times")
            .addClass("game__icon--active-times");
    }
}

// active player marker
function cellIcon() {
    return (activePlayer === "circle" || activePlayerNumber === 2) ? "fa fa-circle-o" : "fa-solid fa-xmark";
}

// handle resetting game board
function handleGameReset() {
    gameBoard = [0,1,2,3,4,5,6,7,8];
    disablePlayerInteraction = false;

    Array.prototype.slice.call(
        $(".game__cell")).forEach(function(cell) {
            cell.dataset.checked = false;
            cell.className = "game__cell";
            cell.children[0].className = "fa";
    });

    if (boardRL[boardRL.length-1] === "draw") {
        $(".game-result .game-result__draw")
            .fadeOut(300, function() {
                $(".game-result")
                    .fadeOut(300).removeClass().addClass("game-result");
        });
    } else {
        $(".game-result .game-result__win")
            .fadeOut(300, function() {
                $(".game-result")
                    .fadeOut(300).removeClass().addClass("game-result");
        });
    }
}

function handleMultiGameReset(result) {
    Array.prototype.slice.call(
        $(".game__cell")).forEach(function(cell) {
            cell.dataset.checked = false;
            cell.className = "game__cell";
            cell.children[0].className = "fa";
    });
    
    if (result === 2) {
        $(".game-result__draw")
        .fadeOut(300, function() {
            $(".game-result")
                .fadeOut(300).removeClass().addClass("game-result");
        });

        return;
    }

    $(".game-result__win")
        .fadeOut(300, function() {
            $(".game-result")
                .fadeOut(300).removeClass().addClass("game-result");
    });

    $(".game-result__lose")
        .fadeOut(300, function() {
            $(".game-result")
                .fadeOut(300).removeClass().addClass("game-result");
    });
}

// handle reset game settings
function updateGameStndings() {
    const currentStandings = $(".game__stats").children();

    for(let i = 0; i < currentStandings.length; i++) {
        if($(currentStandings[i]).hasClass("game__circle")) {
            $(currentStandings[i])
                .children(".game__counter")
                    .html((gameStandings.circle > 1) ? gameStandings.circle+" wins" : gameStandings.circle+" win");
        }

        if($(currentStandings[i]).hasClass("game__times")) {
            $(currentStandings[i])
                .children(".game__counter")
                    .html((gameStandings.times > 1) ? gameStandings.times+" wins" : gameStandings.times+" win");
        }

        if($(currentStandings[i]).hasClass("game__draw")) {
            $(currentStandings[i])
                .children(".game__counter")
                    .html((gameStandings.draw > 1) ? gameStandings.draw+" draws" : gameStandings.draw+" draw");
        }
    }
}

// handle player hover event
function hanlePlayerHover(cell, mode) {
    // TODO : Lag when player hovers the very frist time
    if (disablePlayerInteraction) return;

    if(gameMode === 'multi') {
        socket.emit("getCurrentPlayer", activeRoom, function(marker) {
            if(!marker) {
                console.log("Error: couldn't get current user marker");
            }            
            activePlayerNumber = marker === "times" ? 1 : 2;
        });
    }

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
    const cellCheck = cell.dataset;
    if (cellCheck.checked === "true") return;

    cellCheck.checked = "true";

    $(cell)
        .removeClass("game__cell--hover animate__animated animate__fadeIn");
    $(cell)
        .addClass(value === "X" || value === "times" ?
            "game__cell--times animate__animated animate__bounceIn" :
            "game__cell--circle animate__animated animate__bounceIn");
    $(cell.children[0])
        .removeClass()
        .addClass(value === "X" || value === "times" ? "fa-solid fa-xmark" : "fa fa-circle-o");

    if (gameMode === "single") gameBoard[cellCheck.index] = activePlayer;

    return true;
}

// display game results
function displayGameResult(status, side) {
    if(status === 2) {
        $(".game-result")
            .addClass("game-result--draw");
        $(".game-result")
            .fadeIn(300, function() {
            $(".game-result__draw")
                .fadeIn(300, false);
        }).css("display", "flex");
    };

    if(status === 1) {
        $(".game-result")
            .addClass(side == "circle" ? "game-result--circle" : "game-result--times");
        
            if (gameMode === "single") {
            $(".game-result__win .game-result__status")
                .html(activePlayer === player ? "You Win" : "Ai Wins");
        }

        $(".game-result")
            .fadeIn(300, function() {
                $(".game-result__win")
                    .fadeIn(300, false);
        }).css("display", "flex");
    }
}

// hanlde game results
function handleGameResult(pattern) {
    const allCells = $(".game__cell");

    if (gameMode === "multi") {
        if (!pattern.length) {
            for (let i = 0; i < gameBoard.length; i++) {
                $(allCells[i])
                    .removeClass()
                    .addClass("game__cell game__cell--draw animate__animated animate__fadeOut");
            }
        } else {
            for (let i = 0; i < pattern.length; i++) {
                $(allCells[pattern[i]])
                    .removeClass()
                    .addClass("game__cell game__cell--won animate__animated animate__bounceOut");
            };    
        }
    }

    if (gameMode === "single") {
        const winCombo = winCombinations(gameBoard, activePlayer);
       
        const result = pattern || (winCombo ? 1 : (!winCombo && !getEmptyCells(gameBoard).length) ? 2 : 0);
        
        if (result === 1) {
            boardRL.push(activePlayer);
            (activePlayer === "circle") ? gameStandings.circle++ : gameStandings.times++;
            for (let i = 0; i < winCombo.length; i++) {
                $(allCells[winCombo[i]])
                    .removeClass()
                    .addClass("game__cell game__cell--won animate__animated animate__bounceOut");
            }

            setTimeout(function() {
                displayGameResult(result, activePlayer)
            }, 800);
        }
    
        if (result === 2) {
            boardRL.push("draw");
            gameStandings.draw++;
            for (let i = 0; i < gameBoard.length; i++) {
                $(allCells[i])
                    .removeClass()
                    .addClass("game__cell game__cell--draw animate__animated animate__fadeOut");
            }

            setTimeout(function() {
                displayGameResult(result, activePlayer)
            }, 800);
        }
    }
}

// show player marker
$(".game__cell").on("mouseenter", function(_e) {
    hanlePlayerHover(this, 1);
}).on("mouseleave", function(_e) {
    hanlePlayerHover(this, 0);
});

// game play
$(".game__cell").on("click", function(e) {

    if (gameMode === "multi") {

        console.log(activeGame);

        if (!activeGame || activeGame.gameOver) return;
        const playRoom = activeRoom;

        const cellId = Number(this.id);

        socket.emit(
            "playMove",
            playRoom,
            cellId,
            (success) => {
                if (!success) {
                    console.log("Not able to play move");
                } else {
                    console.log("Move played Successfully");
                    indicatorPlayer();
                }
            }
        )
    }

    if (gameMode === "single") {
        if ((disablePlayerInteraction) || !handlePlayerMove(this, activePlayer)) return;

        if(checkResults()) return setTimeout(handleFirstMove, 2005);

        handleSwitchPlayer();

        if(activePlayer === ai) {
            disablePlayerInteraction = true;
            setTimeout(
                handleAiMove,
                generateRandomNumber(0, 1000) + generateRandomNumber(0, 1000)
            );
        }
    }
});

/* MULTI PLAYER */

// hanlde game updates  
function updateGame(gameState, location) {

    if (!gameState) {
        activeGame = null;
        activeRoom = null;
        activePlayerNumber = null;
    }
    else {
        activeGame = gameState;

        if (!activeGame.gameState) return;

        activePlayerNumber = activeGame.activePlayer;

       handlePlayerMove($(`#${location}`)[0], activeGame.gameState[location]);
    }

    indicatorPlayer();
}

function displayMultiGameResult(modifier, result) {
    $(".game-result").addClass(`game-result--${modifier}`);

    if (!result) {
        $(".game-result")
            .fadeIn(300, function() {
            $(`.game-result__${modifier}`.toLowerCase())
                .fadeIn(300, false);
        }).css("display", "flex");

        return;
    }

    $(`.game-result__${result} .game-result__status`.toLowerCase()).html(`You ${result}`);

    $(".game-result")
        .fadeIn(300, function() {
            $(`.game-result__${result}`.toLowerCase())
                .fadeIn(300, false);
    }).css("display", "flex");

}

// multiplayer setup
socket.on("update", (gameState, location) => {
    updateGame(gameState, location);
});

socket.on("terminated", () => {updateGame(null)});

socket.on("gameOver", function(gameState) {
    const result = gameState.winCombinations.length ? 1 : 2;

    if (result === 1) {
        
       handleGameResult(gameState.winCombinations);

        if (gameState.activePlayer === 1) {
            socket.emit("getCurrentPlayer", activeRoom, function(marker) {
                if (marker === "times") {
                    setTimeout(function() {
                        displayMultiGameResult('times', 'Win');
                    }, 800);
                } else {
                    setTimeout(function() {
                        displayMultiGameResult('lose', 'Lose');
                    }, 800);
                }
            });
        };

        if (gameState.activePlayer === 2) {
            socket.emit("getCurrentPlayer", activeRoom, function(marker) {
                if (marker === "circle") {
                    setTimeout(function() {
                        displayMultiGameResult('circles', 'Win');
                    }, 800);
                } else {
                    setTimeout(function() {
                        displayMultiGameResult('lose', 'Lose');
                    }, 800);
                }
            });
        };
    }

    if (result === 2) {

        handleGameResult(gameState.winCombinations);

        setTimeout(function() {
            displayMultiGameResult('draw', false);
        }, 800);
    }

});

socket.on("resetGame", function(newGame) {

    setTimeout(function() {
        handleMultiGameReset();
    }, 3000);

    activeGame = newGame;
    activePlayerNumber = activeGame.activePlayer;

    indicatorPlayer();

    gameStandings.times = activeGame.gameStandings.player1;
    gameStandings.circle = activeGame.gameStandings.player2;
    gameStandings.draw = activeGame.gameStandings.draw;

    updateGameStndings();
});

socket.on('lobbyRoomWaiting', function(waitInLobby) {
    if(waitInLobby) {
        $(".join")
        .fadeOut(300, function() {
            $(".wait")
                .fadeIn()
                .css("display", "flex");
        });

        return;
    }
    
    $(".join").fadeOut(300);
    $(".wait").fadeOut(300);
    $(".lobby").fadeOut(300);

    setTimeout(function() {
        $(".game").fadeIn().css("display", "flex")
    }, 300);
});

// multiplayer join request

$("#join-game").on("submit", function(e) {
    e.preventDefault();

    // quick and simple validation
    // TODO: style invalid form fields accordingly
    
    const playerName = $("#join-name").val().trim();
    const playRoom = $("#join-room").val().trim();
    handleJoinGame(playerName, playRoom);

    this.reset();
    indicatorPlayer();
});

/* SINGLE PLAYER */

function generateRandomNumber(start, end) {
    return Math.floor(Math.random(start) * end);
}

function getEmptyCells(board){
    return board.filter(function (marker){
        return marker !== "circle" && marker !== "times"
    });
}

function winCombinations(board, player) {
    if (board[0] == player && board[1] == player && board[2] == player) return [0,1,2];
    if (board[3] == player && board[4] == player && board[5] == player) return [3,4,5];
    if (board[6] == player && board[7] == player && board[8] == player) return [6,7,8];
    if (board[0] == player && board[3] == player && board[6] == player) return [0,3,6];
    if (board[1] == player && board[4] == player && board[7] == player) return [1,4,7];
    if (board[2] == player && board[5] == player && board[8] == player) return [2,5,8];
    if (board[0] == player && board[4] == player && board[8] == player) return [0,4,8];
    if (board[2] == player && board[4] == player && board[6] == player) return [2,4,6];

    return false;
}

function checkResults() {

    if (winCombinations(gameBoard, activePlayer) || !getEmptyCells(gameBoard).length) {
        disablePlayerInteraction = true;

        handleGameResult();
        updateGameStndings();

        setTimeout(handleGameReset, 2000);

        return true;
    }

    return false;
}

function generateAiMove(newBoard, gamePlayer){
    const emptyCells = getEmptyCells(newBoard);

    if (winCombinations(newBoard, ai)) return {score:10};
    if (winCombinations(newBoard, player)) return {score:-10};
    if (emptyCells.length === 0) return {score:0};

    let moves = [];

    for (let i = 0; i < emptyCells.length; i++) {
        let move = {};
        move.index = newBoard[emptyCells[i]];

        newBoard[emptyCells[i]] = gamePlayer;

        if (gamePlayer == ai){
            let result = generateAiMove(newBoard, player);
            move.score = result.score;
        }
        else{
            let result = generateAiMove(newBoard, ai);
            move.score = result.score;
        }

        newBoard[emptyCells[i]] = move.index;
        moves.push(move);
    }

    let bestMove;

    if (gamePlayer === ai) {
        let bestScore = -Infinity;
        for(let i = 0; i < moves.length; i++){
            if (moves[i].score > bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for(let i = 0; i < moves.length; i++){
            if (moves[i].score < bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function handleAiMove(startTheGame) {
    activePlayer = ai;

    masterMove = $(".game__cell")[generateAiMove(gameBoard, activePlayer).index];
    noviceMove = $(".game__cell")[getEmptyCells(gameBoard)[generateRandomNumber(0, getEmptyCells(gameBoard).length)]];

    if(startTheGame) {
        handlePlayerMove($(".game__cell")[boardCM[generateRandomNumber(0, boardCM.length)]], activePlayer);
    } else {
        if(aiLevel === 1) (generateRandomNumber(0, 10) < 3) ? handlePlayerMove(masterMove, activePlayer) : handlePlayerMove(noviceMove, activePlayer);
        if(aiLevel === 2) (generateRandomNumber(0, 10) < 7) ? handlePlayerMove(masterMove, activePlayer) : handlePlayerMove(noviceMove, activePlayer);
        if(aiLevel === 3) handlePlayerMove(masterMove, activePlayer);
    }
    
    if (checkResults()) return setTimeout(handleFirstMove, 2005);

    handleSwitchPlayer();
    disablePlayerInteraction = false;
}


function handleFirstMove() {
    if(firstPlayer === player) {
        firstPlayer = activePlayer = ai;
            disablePlayerInteraction = true;
            setTimeout(function() {
                handleAiMove(true);
            }, generateRandomNumber(0, 1000) + 500);
    } else {
        firstPlayer = activePlayer = player;
        disablePlayerInteraction = false;
    }

    indicatorPlayer();
}

function handleSwitchPlayer() {
    activePlayer = (activePlayer === player) ? ai : player;

    indicatorPlayer();
}

// #3   single player / difficulty level
$(".level__size").on("click", function(e) {
    if (!this.dataset.level) return false;

    aiLevel = parseInt(this.dataset.level);

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

// #2   single player / marker / circle or times
$(".side__icon").on("click", function(_e) {
    if (!this.dataset.side) return;

    if (gameMode === "single") {

        player = this.dataset.side;
        activePlayer = player;
        firstPlayer = player;
    
        ai = (player === 'circle') ? 'times' : 'circle';
    
            $(".level")
                .addClass(player === "circle" ? "level--circle" : "level--times");
    
            $(player === "circle" ? ".level__icon--circle" : ".level__icon--times")
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

// #1   choose game mode
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

                $(".game__mode-text").html("ulti Player")

                socket.emit("lobbyRoom", (lobbyRoomSuccess) => {
                    if(!lobbyRoomSuccess) {
                        $(".lobby__no-rooms").css("display", "block");
                        return;
                    }

                    lobbyRoomSuccess.forEach(function(room) {
                        $(".lobby__rooms").append(
                            `<a class="lobby__room" data-room="${room}" href="#">
                                <li class="lobby__room-name">${room}</li>
                            </a>`
                        );
                    });

                    handleLobbyRoomJoin();
                });
            
                $(".lobby")
                    .fadeIn()
                    .css("display", "flex");
            }
    });
});


function handleJoinGame(playerName, playRoom) {
    if (!playerName && !playRoom) return;

    socket.emit("joinGame", playRoom, playerName, (joinSuccess, playerNumber) => {
        if(!joinSuccess) {
            console.log('!!Error: Not able to create/join game');
            return;
        }
        activeRoom = playRoom;
        activePlayerNumber = playerNumber;
    });
}

function handleLobbyRoomJoin() {
    $(".lobby__room").on("click", function(e) {
        e.preventDefault();
        
        const playerName = "Player 2";
        const playRoom = this.dataset.room;

        handleJoinGame(playerName, playRoom);

        $(".lobby")
        .fadeOut(300, function() {
            $(".game")
                .fadeIn()
                .css("display", "flex");
        });
        
        indicatorPlayer();
    });
};

$("#lobby-action").on("click", function(e) {
    e.preventDefault();

    $(".lobby")
        .fadeOut(function() {
            $(".join")
            .fadeIn()
            .css("display", "flex");
        });
});

$("#game-refresh").on("click", function(_e) {
    if (getEmptyCells(gameBoard).length === 9) return;

    disablePlayerInteraction = true;
    handleGameResult(2); updateGameStndings();
    setTimeout(handleGameReset, 2000);
    setTimeout(handleFirstMove, 2005);
});

$("#game-reset").on("click", function(_e) {    
    gameMode = "";
    player = "";
    ai = "";
    activePlayer = player;
    firstPlayer = player;

    aiLevel = 0;
    gameStandings = {
        circle: 0,
        times: 0,
        draw: 0
    };

    handleGameReset();
    updateGameStndings();
    
    $(".game").fadeOut(300, function() {
        $(".mode").fadeIn();
    });
});


$(".splash").fadeIn(300, function() {

    setTimeout(function() {
        const logo = $(".splash__logo")[0];
        const symbol = $(".splash__symbol")[0];
    
        $(logo.children[0])
            .removeClass()
            .addClass("animate__animated animate__bounceOutLeft");
    
        $(logo.children[1])
            .removeClass()
            .addClass("animate__animated animate__bounceOutRight");
    
        $(symbol.children[0])
            .removeClass()
            .addClass("splash__icon animate__animated animate__bounceOutDown");
    
        $(symbol.children[1])
            .removeClass()
            .addClass("splash__icon animate__animated animate__bounceOutUp");
    }, 1800);

    setTimeout(function() {
        $(".splash").fadeOut(300, function() {

            $(".logo")
            .removeClass()
            .addClass('logo animate__animated animate__fadeInDown')
            .css("display", "flex");

            setTimeout(function() {
                $(".mode").fadeIn(300, function() {

                    $(".footer")
                        .removeClass()
                        .addClass('footer animate__animated animate__fadeInUp')
                        .css("display", "block"); 

                }).css("display", "flex");
            }, 600);
        });
    }, 2700);

}).css("display", "flex");