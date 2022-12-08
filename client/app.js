let gameMode = "";

// choose game mode
$(".mode__type").on("click", function(_e) {
    if (this.dataset.mode) {
        gameMode = this.dataset.mode;
    }
    $(".mode")
        .fadeOut(300, function() {
            // TODO
    });
});