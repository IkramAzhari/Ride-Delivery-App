
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

module.exports = {
  reportLostItem,
  getMyLostItems,
};
