
const express = require('express');
const router = express.Router();

const {
  reportLostItem,
  getMyLostItems,
  getDriverLostItems,
  replyToLostItem,
} = require('../controllers/lostItemController');

const auth = require('../middlewares/authMiddleware');

router.post('/', auth, reportLostItem);
router.get('/my', auth, getMyLostItems);

// Driver routes
router.get('/driver', auth, getDriverLostItems);
router.patch('/:id/reply', auth, replyToLostItem);

module.exports = router;
