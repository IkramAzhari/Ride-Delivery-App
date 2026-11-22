const mongoose = require('mongoose');

const FareSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default' },
  baseFare: { type: Number, required: true, min: 0 },
  pricePerKm: { type: Number, required: true, min: 0 },
  minimumFarePercent: { type: Number, required: true, min: 0, max: 100 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('FareSettings', FareSettingsSchema);
