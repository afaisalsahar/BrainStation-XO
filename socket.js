import { Game, Player } from './game.js';
import { Server } from 'socket.io';


const fireSocketServer = (server) => {
	const io = new Server(server);
	const activeGames = new Map();

	io.on("connection", (socket) => {
		console.log(`Socket connection: ${socket.id}`);

		socket.on("disconnecting", () => {
			// Terminate games and disconnect all players if
			// disconnecting socket was participating
			console.log("Disconnecting socket " + socket.id);
			activeGames.forEach((currentGame, currentRoom) => {
				if (
					currentGame.player1?.playerId === socket.id ||
					currentGame.player2?.playerId === socket.id
				) {
					io.to(currentRoom).emit("terminated");
					io.socketsLeave(currentRoom);
					activeGames.delete(currentRoom);
				}
			});
		});

		// socket.on("resetGame", function() {
		// 	console.log("reset game server ");
		// });

		socket.on("lobbyRoom", (callback) => {
			if (!Array.from(activeGames.values()).length) {
				callback(false);
				return;
			}

			const availableRooms = [];

			for (const room of activeGames) {
				availableRooms.push(room[0]);
			}

			callback(availableRooms);
		});

		socket.on("getCurrentPlayer", (playRoom, callback) => {

			if(!activeGames.get(playRoom)) return;

			const playerId = activeGames.get(playRoom).player1.playerId;
			const socketId = socket.id;

			if (!playerId || !socketId) {
				callback(false);
				return;
			}

			callback(playerId === socketId ? 'times' : 'circle');
		})

		socket.on("joinGame", (playRoom, playerName, callback) => {
			console.log(`User: ${playerName} joined room: ${playRoom}`);

			let game = activeGames.get(playRoom);
			let playerNumber = -1;

			let waitInLobby = false;

			if (game) {
				// If game exists and a slot is open, insert as player 2
				if (game.player2 !== null) {
					callback(false, -1);
					return;
				}

				game.player2 = new Player(socket.id, playerName, 2);
				playerNumber = 2;

				waitInLobby = false;
			} else {
				// Create and store new game, fill as player 1
				game = new Game(new Player(socket.id, playerName, 1));
				activeGames.set(playRoom, game);
				playerNumber = 1;

				waitInLobby = true;
			}

			// // Terminate and disconnect anyone involved in games the user is currently in
			activeGames.forEach((currentGame, currentRoom) => {
				if (currentRoom !== playRoom && (
					currentGame.player1.playerId === socket.id ||
					currentGame.player2.playerId === socket.id
				)) {
					io.to(currentGame).emit('terminated');
					io.socketsLeave(currentRoom);
					activeGames.delete(currentRoom);
				}
			});

			socket.join(playRoom);
			
			io.to(playRoom).emit('update', game.currentState);
			io.to(playRoom).emit('lobbyRoomWaiting', waitInLobby);

			callback(true, playerNumber);
		});

		socket.on("playMove", (playRoom, location, callback) => {
			console.log("playMove", playRoom, location);

			let game = activeGames.get(playRoom);

			// Game doesn't exist or isn't full yet
			if (!game || !game.player1 || !game.player2) {
				callback(false);
				return;
			}

			// User isn't part of the game
			if (
				game.player1.playerId !== socket.id &&
				game.player2.playerId !== socket.id
			) {
				callback(false);
				return;
			}

			const playerNumber = game.player1.playerId === socket.id ? 1 : 2;

			// Play the new move
			const newState = game.playMove(playerNumber, location);

			if (!newState) {
				callback(false);
			} else {
				// Move worked, terminate game if it is now over so room is reusable
				io.to(playRoom).emit("update", newState, location);

				if (newState.gameOver) {
					// GameOver - Results
					io.to(playRoom).emit("gameOver", newState);

					// reset game to start again
					io.to(playRoom).emit("resetGame", "testval");

					// io.socketsLeave(playRoom);
					// activeGames.delete(playRoom);
				}
				callback(true);
			}
		});
	});
};

export default fireSocketServer;