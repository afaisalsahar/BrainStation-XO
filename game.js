function Game (player1, player2) {
    this.player1 = player1 ?? null;
    this.player2 = player2 ?? null;

    this.activePlayer = 1;
    this.gameBoard = [0,1,2,3,4,5,6,7,8];

    this.winCombinations = undefined;

    this.gameOver = false;

    this.playMove = function (playerNumber, location) {
        if (this.gameOver) return;
        if (playerNumber !== this.activePlayer) return;

        if (typeof this.gameBoard[location] !== 'number') return;
        this.gameBoard[location] = playerNumber === 1 ? "X" : "O";

        this.checkIfGameOver();

        if (!this.gameOver) this.activePlayer = this.activePlayer === 1 ? 2 : 1;

        return this.currentState();
    }

    this.getEmptyCells = function(){
        return this.gameBoard.filter(function (marker){
            return marker !== "O" && marker !== "X"
        });
    }

    this.checkIfGameOver = function () {
        const board = this.gameBoard;
        const player = this.activePlayer === 1 ? 'X' : 'O';

        if (board[0] == player && board[1] == player && board[2] == player) {
            this.winCombinations = [0,1,2];
            this.gameOver = true;
            return true;
        }
        
        if (board[3] == player && board[4] == player && board[5] == player) {
            this.winCombinations = [3,4,5];
            this.gameOver = true;
            return true;
        }

        if (board[6] == player && board[7] == player && board[8] == player) {
            this.winCombinations = [6,7,8];
            this.gameOver = true;
            return true;
        }

        if (board[0] == player && board[3] == player && board[6] == player) {
            this.winCombinations = [0,3,6];
            this.gameOver = true;
            return true;
        }

        if (board[1] == player && board[4] == player && board[7] == player) {
            this.winCombinations = [1,4,7];
            this.gameOver = true;
            return true;
        }
        
        if (board[2] == player && board[5] == player && board[8] == player) {
            this.winCombinations = [2,5,8];
            this.gameOver = true;
            return true;
        }

        if (board[0] == player && board[4] == player && board[8] == player) {
            this.winCombinations = [0,4,8];
            this.gameOver = true;
            return true;
        }

        if (board[2] == player && board[4] == player && board[6] == player) {
            this.winCombinations = [2,4,6];
            this.gameOver = true;
            return true;
        }
        
        if(!this.getEmptyCells().length) {
            this.winCombinations = [];
            this.gameOver = true;
            return true;
        }

        this.gameOver = false;
        return false;
    }

    this.currentState = function () {
        return {
			playerOneName: this.player1?.playerName,
			playerTwoName: this.player2?.playerName,
			activePlayer: this.activePlayer,
			gameState: this.gameBoard,
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
