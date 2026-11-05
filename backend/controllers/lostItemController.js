
const LostItem = require('../models/lostItem');
const Ride = require('../models/Ride');

const reportLostItem = async (req, res) => {
  try {
    const { rideId, description } = req.body;

    if (!rideId || !description || !description.trim()) {
      return res.status(400).json({
        message: 'Ride ID and item description are required',
      });
    }

    const riderId = req.user.userId;

    if (!riderId) {
      return res.status(401).json({
        message: 'User not authenticated',
      });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        message: 'Ride not found',
      });
    }

    if (String(ride.rider) !== String(riderId)) {
      return res.status(403).json({
        message: 'You can only report lost items for your own rides',
      });
    }

    const lostItem = await LostItem.create({
      ride: rideId,
      rider: riderId,
      description: description.trim(),
    });

    return res.status(201).json({
      message: 'Lost item reported successfully',
      lostItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to report lost item',
      error: error.message,
    });
  }
};

const getMyLostItems = async (req, res) => {
  try {
    const riderId = req.user.userId;

    const lostItems = await LostItem.find({
      rider: riderId,
    })
      .populate('ride')
      .sort({ createdAt: -1 });

    return res.status(200).json(lostItems);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch lost items',
      error: error.message,
    });
  }
};

// Get lost item reports for the logged-in driver's completed rides
const getDriverLostItems = async (req, res) => {
  try {
    const driverId = req.user.userId;

    const completedRides = await Ride.find({
      driver: driverId,
      status: 'completed',
    }).select('_id');

    const rideIds = completedRides.map((ride) => ride._id);

    const lostItems = await LostItem.find({
      ride: { $in: rideIds },
    })
      .populate('ride', 'pickup dropoff status')
      .populate('rider', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(lostItems);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch driver lost items',
      error: error.message,
    });
  }
};

// Driver replies to a lost item report
const replyToLostItem = async (req, res) => {
  try {
    const { reply, status } = req.body;
    const driverId = req.user.userId;
    const { id } = req.params;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        message: 'Reply is required',
      });
    }

    if (!['found', 'not_found'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be found or not_found',
      });
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      return res.status(404).json({
        message: 'Lost item report not found',
      });
    }

    const ride = await Ride.findById(lostItem.ride);

    if (!ride || String(ride.driver) !== String(driverId)) {
      return res.status(403).json({
        message: 'You can only reply to reports for your own rides',
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        message: 'You can only reply to reports for completed rides',
      });
    }

    lostItem.driverReply = reply.trim();
    lostItem.status = status;
    lostItem.driverRespondedAt = new Date();

    await lostItem.save();

    return res.status(200).json({
      message: 'Reply sent successfully',
      lostItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to send reply',
      error: error.message,
    });
  }
};

module.exports = {
  reportLostItem,
  getMyLostItems,
  getDriverLostItems,
  replyToLostItem,
};
