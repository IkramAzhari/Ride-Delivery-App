
const express = require('express');
const router = express.Router();

const {
  reportLostItem,
  getMyLostItems,
} = require('../controllers/lostItemController');

const auth = require('../middlewares/authMiddleware');

router.post('/', auth, reportLostItem);
router.get('/my', auth, getMyLostItems);

module.exports = router;
