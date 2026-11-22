const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { getFareSettings, updateFareSettings } = require('../controllers/adminController');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
}

router.use(auth, requireAdmin);
router.get('/fare-settings', getFareSettings);
router.put('/fare-settings', updateFareSettings);

module.exports = router;
