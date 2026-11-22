const FareSettings = require('../models/FareSettings');

const defaults = () => ({
  baseFare: Number(process.env.BASE_FARE_LYD || 5),
  pricePerKm: Number(process.env.PRICE_PER_KM_LYD || 2),
  minimumFarePercent: Number(process.env.MIN_FARE_PERCENT || 85),
  currency: 'LYD',
});

exports.getFareSettings = async (req, res) => {
  try {
    const settings = await FareSettings.findOne({ key: 'default' }).lean();
    return res.json(settings ? {
      baseFare: settings.baseFare,
      pricePerKm: settings.pricePerKm,
      minimumFarePercent: settings.minimumFarePercent,
      currency: 'LYD',
    } : defaults());
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load fare settings' });
  }
};

exports.updateFareSettings = async (req, res) => {
  const { baseFare, pricePerKm, minimumFarePercent } = req.body;
  if (![baseFare, pricePerKm, minimumFarePercent].every((value) => Number.isFinite(Number(value)))) {
    return res.status(400).json({ error: 'All fare settings must be valid numbers' });
  }

  const values = {
    baseFare: Number(baseFare),
    pricePerKm: Number(pricePerKm),
    minimumFarePercent: Number(minimumFarePercent),
  };
  if (values.baseFare < 0 || values.pricePerKm < 0 ||
      values.minimumFarePercent < 0 || values.minimumFarePercent > 100) {
    return res.status(400).json({ error: 'Base fare and price per km must be non-negative; minimum percentage must be between 0 and 100' });
  }

  try {
    const settings = await FareSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: { ...values, updatedBy: req.user.userId } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json({
      baseFare: settings.baseFare,
      pricePerKm: settings.pricePerKm,
      minimumFarePercent: settings.minimumFarePercent,
      currency: 'LYD',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save fare settings' });
  }
};
