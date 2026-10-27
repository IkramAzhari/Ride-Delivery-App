const app = require('./app');
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: { origin: '*' }
});
const rideSocket = require('./sockets/rideSocket');
rideSocket(io);

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => console.log('Server running at ${PORT}'));