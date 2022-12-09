let gameMode = "";
let playerOne = "";
let playerTwo = "";
let activePlayer = playerOne;
let firstPlayer = playerTwo;

let gameLevel = 0;

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

$(".level__size").on("click", function(e) {
    if (!this.dataset.level) return false;

    gameLevel = parseInt(this.dataset.level);
});
