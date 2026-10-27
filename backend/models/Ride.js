// backend/models/Ride.js
const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pickup: String,
    dropoff: String,
    status: {
      type: String,
      enum: ['requested', 'accepted', 'completed','cancelled'],
      default: 'requested',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', RideSchema);
