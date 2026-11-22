const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  byRole: { type: String, enum: ['rider', 'driver'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

const RideSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickup: String,
  dropoff: String,
  pickupCoordinates: { type: [Number], default: undefined },
  dropoffCoordinates: { type: [Number], default: undefined },
  distanceKm: { type: Number, min: 0 },
  estimatedFare: { type: Number, min: 0 },
  minimumFare: { type: Number, min: 0 },
  agreedFare: { type: Number, min: 0 },
  currency: { type: String, default: 'LYD' },
  offers: { type: [OfferSchema], default: [] },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'completed', 'cancelled'],
    default: 'requested',
  },
}, { timestamps: true });

module.exports = mongoose.model('Ride', RideSchema);
