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


function indicatorPlayer() {
    // $(".game__indicator .game__icon").removeClass("game__icon--active");
    // $((activePlayer == "circle") ? ".game__indicator .game__icon--circle" : ".game__indicator .game__icon--times").addClass("game__icon--active");

    if (activePlayer === 'circle') {
        $(".game__indicator .game__icon").removeClass("game__icon--active-times");
        $(".game__indicator .game__icon--circle").addClass("game__icon--active-circle");
    } else {
        $(".game__indicator .game__icon").removeClass("game__icon--active-circle");
        $(".game__indicator .game__icon--times").addClass("game__icon--active-times");
    }

}

function cellIcon() {
    return (activePlayer === "circle") ? "fa fa-circle-o" : "fa-solid fa-xmark";
}

// handle player hover event
function handleCellHover(cell, mode) {
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

// show player marker
$(".game__cell").on("mouseenter", function(_e) {
    handleCellHover(this,1);
}).on("mouseleave", function(_e) {
    handleCellHover(this,0);
});


// choose game mode
$(".mode__type").on("click", function(_e) {
    if (this.dataset.mode) {
        gameMode = this.dataset.mode;
    }

    $(".mode")
        .fadeOut(300, function() {
            $(".side")
                .fadeIn()
                .css("display", "flex");
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