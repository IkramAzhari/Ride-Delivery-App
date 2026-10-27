// backend/routes/rideRoutes.js
const router = require('express').Router();
const {
  createRide,
  listRides,
  listPendingRides,
  acceptRide,
  completeRide,
  cancelRide
} = require('../controllers/rideController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, createRide);
router.get('/', auth, listRides);
router.get('/pending', auth, listPendingRides);

router.post('/:id/accept', auth, acceptRide);
router.post('/:id/complete', auth, completeRide);
router.post('/:id/cancel', auth, cancelRide);

router.patch('/:id/complete', auth, completeRide);
module.exports = router;


