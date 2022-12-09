let gameMode = "";
let playerOne = "";
let playerTwo = "";
let activePlayer = playerOne;
let firstPlayer = playerTwo;

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
});