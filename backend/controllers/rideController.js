// backend/controllers/rideController.js
const Ride = require('../models/Ride');

async function createRide(req, res) {
  const { pickup, dropoff } = req.body;
  try {
    if (!pickup || !dropoff) {
      return res.status(400).json({ error: 'Pickup and dropoff are required' });
    }

    const ride = new Ride({
      pickup,
      dropoff,
      rider: req.user.userId,
      status: 'requested',
    });

    await ride.save();
    return res.json(ride);
  } catch (err) {
    console.error('Create ride error:', err);
    return res.status(500).json({ error: 'Failed to create ride' });
  }
}

async function listRides(req, res) {
  try {
    const rides = await Ride.find({ rider: req.user.userId }).sort({ createdAt: -1 });
    return res.json(rides);
  } catch (err) {
    console.error('List rides error:', err);
    return res.status(500).json({ error: 'Failed to fetch rides' });
  }
}

async function listPendingRides(req, res) {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can see pending rides' });
    }

    const rides = await Ride.find({ status: 'requested' })
      .populate('rider', 'name email')
      .sort({ createdAt: -1 });

    return res.json(rides);
  } catch (err) {
    console.error('Pending rides error:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
}

async function acceptRide(req, res) {
  const rideId = req.params.id;
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (ride.status !== 'requested') {
      return res.status(400).json({ error: 'Ride is not in requested state' });
    }

    ride.status = 'accepted';
    ride.driver = req.user.userId;
    await ride.save();

    return res.json(ride);
  } catch (err) {
    console.error('Accept ride error:', err);
    return res.status(500).json({ error: 'Failed to accept ride' });
  }
}

async function completeRide(req, res) {
  const rideId = req.params.id;
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    if (ride.status !== 'accepted') {
      return res.status(400).json({ error: 'Ride is not in accepted state' });
    }

    ride.status = 'completed';
    await ride.save();

    return res.json(ride);
  } catch (err) {
    console.error('Complete ride error:', err);
    return res.status(500).json({ error: 'Failed to complete ride' });
  }
}

async function cancelRide(req, res) {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (String(ride.rider) !== req.user.userId) {
      return res.status(403).json({ error: 'Not your ride' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({
        error: 'Only requested rides can be cancelled',
      });
    }

    ride.status = 'cancelled';
    await ride.save();

    return res.json(ride);
  } catch (err) {
    console.error('Cancel ride error:', err);
    return res.status(500).json({ error: 'Failed to cancel ride' });
  }
}

module.exports = {
  createRide,
  listRides,
  listPendingRides,
  acceptRide,
  completeRide,
  cancelRide,
};