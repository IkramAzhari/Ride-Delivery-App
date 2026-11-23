const FareSettings = require('../models/FareSettings');

function validCoordinates(value) {
  return Array.isArray(value) && value.length === 2 &&
    Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1])) &&
    Number(value[0]) >= -90 && Number(value[0]) <= 90 &&
    Number(value[1]) >= -180 && Number(value[1]) <= 180;
}
const money = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

async function getFareSettings() {
  const saved = await FareSettings.findOne({ key: 'default' }).lean();
  return saved || {
    baseFare: Number(process.env.BASE_FARE_LYD || 5),
    pricePerKm: Number(process.env.PRICE_PER_KM_LYD || 1),
    minimumFarePercent: Number(process.env.MIN_FARE_PERCENT || 85),
  };
}

async function calculateTripFare(pickupCoordinates, dropoffCoordinates) {
  if (!validCoordinates(pickupCoordinates) || !validCoordinates(dropoffCoordinates)) {
    throw new Error('Valid pickup and dropoff coordinates are required');
  }

  const settings = await getFareSettings();
  if (![settings.baseFare, settings.pricePerKm, settings.minimumFarePercent].every(Number.isFinite) ||
      settings.baseFare < 0 || settings.pricePerKm < 0 ||
      settings.minimumFarePercent < 0 || settings.minimumFarePercent > 100) {
    throw new Error('Fare settings are invalid; ask an administrator to review them');
  }

  const [lat1, lon1] = pickupCoordinates.map(Number);
  const [lat2, lon2] = dropoffCoordinates.map(Number);
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Route service is unavailable');
  const data = await response.json();
  const route = data.routes && data.routes[0];
  if (data.code !== 'Ok' || !route || !Number.isFinite(route.distance)) {
    throw new Error('Could not calculate a driving route');
  }

  const distanceKm = money(route.distance / 1000);
  const estimatedFare = money(settings.baseFare + distanceKm * settings.pricePerKm);
  const minimumFare = money(Math.max(settings.baseFare, estimatedFare * settings.minimumFarePercent / 100));
  return { distanceKm, estimatedFare, minimumFare, currency: 'LYD' };
}

module.exports = { calculateTripFare, validCoordinates, getFareSettings };
