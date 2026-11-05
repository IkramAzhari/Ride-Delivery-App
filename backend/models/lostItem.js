
const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['reported', 'under_review', 'found', 'not_found', 'resolved'],
      default: 'reported',
    },
    driverReply: {
      type: String,
      trim: true,
      default: '',
    },
    driverRespondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostItem', lostItemSchema);
