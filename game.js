function Game (player1, player2) {
    this.player1 = player1 ?? null;
    this.player2 = player2 ?? null;

    this.activePlayer = 1;

    this.gameState = [
        [" ", " ", " "],
        [" ", " ", " "],
        [" ", " ", " "]
    ];

    this.winCombinations = undefined;

    this.gameOver = false;

    this.playMove = function (playerNumber, location) {
        if (this.gameOver) return;
        if (playerNumber !== this.activePlayer) return;
        if (location.length !== 2) return;
        if (this.gameState[location[0]][location[1]] !== " ") return;

        this.gameState[location[0]][location[1]] = playerNumber === 1 ? "X" : "O";

        console.log(this.gameState);

        this.checkIfGameOver();

        if (!this.gameOver) this.activePlayer = this.activePlayer === 1 ? 2 : 1;

        return this.currentState();
    }

    this.checkIfGameOver = function () {
        const currentGameState = this.gameState;

        for (let s = 0; s < 2; s++) {
            const symbol = s === 0 ? "X" : "O";

            for (let i = 0; i < 3; i++) {
                if (
                    currentGameState[i][0] === symbol &&
                    currentGameState[i][1] === symbol &&
                    currentGameState[i][2] === symbol) {
                        this.winCombinations = [
                            [i, 0],
                            [i, 1],
                            [i, 2]
                        ];

                        this.gameOver = true;
                        return;
                }

                if (
                    currentGameState[0][i] === symbol &&
                    currentGameState[1][i] === symbol &&
                    currentGameState[2][i] === symbol) {
                        this.winCombinations = [
                            [0, i],
                            [1, i],
                            [2, i]
                        ];

                        this.gameOver = true;
                        return;
                }

                if (
                    currentGameState[0][0] === symbol &&
                    currentGameState[1][1] === symbol &&
                    currentGameState[2][2] === symbol) {
                        this.winCombinations = [
                            [0, 0],
                            [1, 1],
                            [2, 2]
                        ];

                        this.gameOver = true;
                        return;
                }

                if (
                    currentGameState[0][2] === symbol &&
                    currentGameState[1][1] === symbol &&
                    currentGameState[2][0] === symbol) {
                        this.winCombinations = [
                            [0, 2],
                            [1, 1],
                            [2, 0]
                        ];

                        this.gameOver = true;
                        return;
                }
            }

            let count = 0;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (currentGameState[i][j] !== " ") {
                        count++;
                    }
                }
            }
            if (count === 9) {
                this.winCombinations = null;
                this.gameOver = true;
            }
        }
    }

    this.currentState = function () {
        return {
			playerOneName: this.player1?.playerName,
			playerTwoName: this.player2?.playerName,
			activePlayer: this.activePlayer,
			gameState: this.gameState,
			gameOver: this.gameOver,
			winCombinations: this.winCombinations,
        }
    }
}

function Player (playerId, playerName, playerNumber) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.playerNumber = playerNumber;
}

export { Game, Player };
