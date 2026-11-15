// backend/sockets/rideSocket.js

const Ride = require('../models/Ride');

function rideSocket(io) {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join room for a specific ride (e.g., rideId as room name)
    socket.on('joinRide', (rideId) => {
      socket.join(rideId);
      console.log(`Socket ${socket.id} joined ride room ${rideId}`);
    });

    // Listen for ride status updates (e.g., driver accepts ride, ride completed)
    socket.on('updateRideStatus', async ({ rideId, status }) => {
      try {
        // Update status in database
        const ride = await Ride.findByIdAndUpdate(rideId, { status }, { new: true });
        // Emit to all clients in that ride room
        io.to(rideId).emit('rideStatusUpdated', ride);
      } catch (err) {
        socket.emit('error', 'Failed to update ride status');
      }
    });

    // Example: Real-time driver location updates
    socket.on('driverLocation', ({ rideId, location }) => {
      // Broadcast driver location to this ride's room
      io.to(rideId).emit('driverLocationUpdate', location);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = rideSocket;
