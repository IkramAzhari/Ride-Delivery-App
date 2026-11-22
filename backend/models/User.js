const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  // Admin accounts must be provisioned by an existing trusted operator.
  role: { type: String, enum: ['rider', 'driver', 'admin'], required: true },
  rating: Number
});
module.exports = mongoose.model('User', UserSchema);
