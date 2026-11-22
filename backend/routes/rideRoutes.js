const router = require('express').Router();
const {
  createRide, listRides, listPendingRides, listDriverRides,
  acceptRide, createRiderOffer, createDriverCounterOffer,
  acceptLatestOffer, completeRide, cancelRide,
} = require('../controllers/rideController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, createRide);
router.get('/', auth, listRides);
router.get('/pending', auth, listPendingRides);
router.get('/driver', auth, listDriverRides);
router.post('/:id/accept', auth, acceptRide);
router.post('/:id/offers', auth, createRiderOffer);
router.post('/:id/counter-offer', auth, createDriverCounterOffer);
router.post('/:id/offers/accept', auth, acceptLatestOffer);
router.post('/:id/complete', auth, completeRide);
router.post('/:id/cancel', auth, cancelRide);
router.patch('/:id/complete', auth, completeRide);

module.exports = router;
