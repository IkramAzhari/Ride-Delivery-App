
const Ride = require('../models/Ride');
const { calculateTripFare } = require('../services/fareService');

// إخفاء الحد الأدنى من البيانات التي ترجع للزبون فقط
function rideForRider(ride) {
  const rideData = ride.toObject ? ride.toObject() : { ...ride };
  delete rideData.minimumFare;
  return rideData;
}

async function createRide(req, res) {
  const { pickup, dropoff, pickupCoordinates, dropoffCoordinates } = req.body;

  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ error: 'Only riders can request rides' });
    }

    if (!pickup || !dropoff) {
      return res.status(400).json({ error: 'Pickup and dropoff are required' });
    }

    const fare = await calculateTripFare(pickupCoordinates, dropoffCoordinates);

    const ride = await Ride.create({
      pickup: String(pickup).trim(),
      dropoff: String(dropoff).trim(),
      pickupCoordinates,
      dropoffCoordinates,
      rider: req.user.userId,
      ...fare,
      status: 'requested',
    });

    return res.status(201).json(rideForRider(ride));
  } catch (err) {
    console.error('Create ride error:', err);
    return res.status(400).json({
      error: err.message || 'Failed to create ride',
    });
  }
}

async function listRides(req, res) {
  try {
    const rides = await Ride.find({
      rider: req.user.userId,
    })
      .populate('offers.user', 'name role')
      .sort({ createdAt: -1 });

    return res.json(rides.map(rideForRider));
  } catch (err) {
    console.error('List rides error:', err);
    return res.status(500).json({ error: 'Failed to fetch rides' });
  }
}

async function listPendingRides(req, res) {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        error: 'Only drivers can see pending rides',
      });
    }

    const rides = await Ride.find({ status: 'requested' })
      .populate('rider', 'name email')
      .populate('offers.user', 'name role')
      .sort({ createdAt: -1 });

    return res.json(rides);
  } catch (err) {
    console.error('Pending rides error:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
}

async function listDriverRides(req, res) {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        error: 'Only drivers can see their rides',
      });
    }

    const rides = await Ride.find({
      driver: req.user.userId,
      status: { $in: ['accepted', 'completed'] },
    })
      .populate('rider', 'name email')
      .sort({ createdAt: -1 });

    return res.json(rides);
  } catch (err) {
    console.error('Driver rides error:', err);
    return res.status(500).json({ error: 'Failed to fetch driver rides' });
  }
}

async function acceptRide(req, res) {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        error: 'Only drivers can accept rides',
      });
    }

    const ride = await Ride.findOne({
      _id: req.params.id,
      status: 'requested',
      offers: { $size: 0 },
    });

    if (!ride) {
      return res.status(400).json({
        error: 'Ride unavailable or has active negotiation',
      });
    }

    ride.status = 'accepted';
    ride.driver = req.user.userId;
    ride.agreedFare = ride.estimatedFare;

    await ride.save();

    return res.json(ride);
  } catch (err) {
    console.error('Accept ride error:', err);
    return res.status(500).json({ error: 'Failed to accept ride' });
  }
}

async function createRiderOffer(req, res) {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({
        error: 'Only riders can make offers',
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (String(ride.rider) !== req.user.userId) {
      return res.status(403).json({ error: 'This is not your ride' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({ error: 'Negotiation is closed' });
    }

    const latest = ride.offers[ride.offers.length - 1];

    if (latest && latest.byRole !== 'driver') {
      return res.status(400).json({
        error: 'Wait for the driver to respond first',
      });
    }

    const amount = Number(req.body.amount);

    // التحقق من الحد الأدنى يبقى شغالاً ولا نكشف قيمته للزبون
    if (
      !Number.isFinite(amount) ||
      amount < ride.minimumFare ||
      amount > ride.estimatedFare
    ) {
      return res.status(400).json({
        error: 'Offer is outside the allowed range. Please adjust your amount.',
      });
    }

    ride.offers.push({
      byRole: 'rider',
      user: req.user.userId,
      amount,
    });

    await ride.save();

    return res.status(201).json(rideForRider(ride));
  } catch (err) {
    console.error('Rider offer error:', err);
    return res.status(500).json({
      error: 'Failed to submit offer',
    });
  }
}

async function createDriverCounterOffer(req, res) {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        error: 'Only drivers can counter-offer',
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({ error: 'Negotiation is closed' });
    }

    const latest = ride.offers[ride.offers.length - 1];

    if (!latest || latest.byRole !== 'rider') {
      return res.status(400).json({
        error: 'A rider offer is required first',
      });
    }

    if (ride.driver && String(ride.driver) !== req.user.userId) {
      return res.status(409).json({
        error: 'Another driver is negotiating this ride',
      });
    }

    const amount = Number(req.body.amount);
    const maximumFare = Math.round(ride.estimatedFare * 1.5 * 100) / 100;

    if (
      !Number.isFinite(amount) ||
      amount < ride.minimumFare ||
      amount > maximumFare
    ) {
      return res.status(400).json({
        error: 'Counter-offer is outside allowed range',
        minimumFare: ride.minimumFare,
        maximumFare,
      });
    }

    ride.driver = req.user.userId;

    ride.offers.push({
      byRole: 'driver',
      user: req.user.userId,
      amount,
    });

    await ride.save();

    return res.status(201).json(ride);
  } catch (err) {
    console.error('Driver counter-offer error:', err);
    return res.status(500).json({
      error: 'Failed to submit counter-offer',
    });
  }
}

async function acceptLatestOffer(req, res) {
  try {
    if (!['rider', 'driver'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Invalid account role' });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({ error: 'Negotiation is closed' });
    }

    const latest = ride.offers[ride.offers.length - 1];

    if (!latest || latest.byRole === req.user.role) {
      return res.status(400).json({
        error: 'No offer from the other party to accept',
      });
    }

    if (req.user.role === 'rider') {
      if (String(ride.rider) !== req.user.userId) {
        return res.status(403).json({ error: 'This is not your ride' });
      }

      if (
        latest.byRole !== 'driver' ||
        !ride.driver ||
        String(latest.user) !== String(ride.driver)
      ) {
        return res.status(403).json({
          error: 'Only the assigned negotiating driver offer can be accepted',
        });
      }
    } else {
      if (
        latest.byRole !== 'rider' ||
        String(latest.user) !== String(ride.rider)
      ) {
        return res.status(400).json({
          error: 'The latest offer is not from this ride’s rider',
        });
      }

      if (ride.driver && String(ride.driver) !== req.user.userId) {
        return res.status(409).json({
          error: 'Another driver is negotiating this ride',
        });
      }

      ride.driver = req.user.userId;
    }

    ride.agreedFare = latest.amount;
    ride.status = 'accepted';

    await ride.save();

    // نخفي الحد الأدنى إذا كان صاحب الطلب هو الزبون
    return res.json(
      req.user.role === 'rider' ? rideForRider(ride) : ride
    );
  } catch (err) {
    console.error('Accept offer error:', err);
    return res.status(500).json({
      error: 'Failed to accept offer',
    });
  }
}

async function completeRide(req, res) {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        error: 'Only drivers can complete rides',
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (String(ride.driver) !== req.user.userId) {
      return res.status(403).json({
        error: 'This ride is not assigned to you',
      });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({
        error: 'Ride is not in accepted state',
      });
    }

    ride.status = 'completed';

    await ride.save();

    return res.json(ride);
  } catch (err) {
    console.error('Complete ride error:', err);
    return res.status(500).json({
      error: 'Failed to complete ride',
    });
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

    return res.json(rideForRider(ride));
  } catch (err) {
    console.error('Cancel ride error:', err);
    return res.status(500).json({
      error: 'Failed to cancel ride',
    });
  }
}

module.exports = {
  createRide,
  listRides,
  listPendingRides,
  listDriverRides,
  acceptRide,
  createRiderOffer,
  createDriverCounterOffer,
  acceptLatestOffer,
  completeRide,
  cancelRide,
};
