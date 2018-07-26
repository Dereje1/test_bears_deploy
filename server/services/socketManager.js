const { io } = require('../index');
const { USER_CONNECTED, SIMULATE_GAMEPLAY } = require('../../client/src/constants');

let playerPool = [];
const activePlayers = [];
const profileResponder = socketId => (
  { // need self socket id to segregate on client
    pool: playerPool,
    self: socketId,
  }
);
module.exports = (socket) => {
  socket.on(USER_CONNECTED, (user) => {
    console.log(`test log msg from client side: ${user}`);

    io.emit(USER_CONNECTED, user);
  });
  socket.on('disconnect', () => {
    const indexOfDisconnected = playerPool.findIndex(s => s.socketId === socket.id);
    playerPool = [...playerPool.slice(0, indexOfDisconnected),
      ...playerPool.slice(indexOfDisconnected + 1)];
    io.emit('CURRENT_POOL', profileResponder(socket.id));
  });
  // PLAYER_JOINED = multiplayer button click
  socket.on('PLAYER_JOINED', (profile) => {
    const playerProfile = JSON.parse(profile);
    playerProfile.socketId = socket.id; // attach socket Id to profile
    playerPool.push(playerProfile);
    io.emit('CURRENT_POOL', profileResponder(socket.id));
  });

  socket.on('REMOVE_PLAYER', (player) => {
    const indexOfDisconnected = playerPool.findIndex(s => s.socketId === player);
    playerPool = [...playerPool.slice(0, indexOfDisconnected),
      ...playerPool.slice(indexOfDisconnected + 1)];
    io.emit('CURRENT_POOL', profileResponder(socket.id));
  });

  socket.on('INVITATION_SENT', (invitation) => {
    io.to(invitation.hostSocketId).emit('INVITATION_RECEIVED', { hostSocketId: socket.id, difficulty: invitation.difficulty });
  });

  socket.on('INVITATION_ACCEPTED', (players) => {
    const playerAIndex = playerPool.findIndex(p =>
      players[0] === p.socketId);
    const playerBIndex = playerPool.findIndex(p =>
      players[1] === p.socketId);
    const playerA = playerPool[playerAIndex];
    const playerB = playerPool[playerBIndex];
    io.to(players[0]).emit('START_GAME', playerB); // emit the opponents
    io.to(players[1]).emit('START_GAME', playerA);
    // remove socekt IDs from pool and add to active Players
    for (let i = 0; i < players.length; i += 1) {
      const poolIds = playerPool.map(p => p.socketId);
      if (poolIds.includes(players[i])) {
        const indxOfPlayer = poolIds.indexOf(players[i]);
        playerPool.splice(indxOfPlayer, 1);
      }
    }
    activePlayers.push(players);
    io.emit('CURRENT_POOL', profileResponder(socket.id));
  });

  socket.on(SIMULATE_GAMEPLAY, (msg) => {
    io.to(msg.socketId).emit(SIMULATE_GAMEPLAY, msg.gameState); // emit the opponents
  });

  socket.on('GAME_OVER', () => {
    // looser is always socketId by nature of the game.
    const playerSetIndex = activePlayers.findIndex(players =>
      (players[0] === socket.id || players[1] === socket.id));
    if (playerSetIndex < 0) return;

    const winner = activePlayers[playerSetIndex].filter(p =>
      socket.id !== p)[0];

    activePlayers.splice(playerSetIndex, 1);
    console.log(`winner is ${winner} and looser is ${socket.id}`);

    io.to(winner).emit('GAME_END', true); // winner gets true
    io.to(socket.id).emit('GAME_END', false);
  });
};

