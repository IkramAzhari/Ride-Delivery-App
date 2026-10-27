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
      enum: ['reported', 'under_review', 'resolved'],
      default: 'reported',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostItem', lostItemSchema);