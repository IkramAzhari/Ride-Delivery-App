const BASE_FARE = Number(process.env.BASE_FARE_LYD || 5);
const PRICE_PER_KM = Number(process.env.PRICE_PER_KM_LYD || 2);
const MIN_FARE_PERCENT = Number(process.env.MIN_FARE_PERCENT || 85);

function validCoordinates(value) {
  return Array.isArray(value) && value.length === 2 &&
    Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1])) &&
    Number(value[0]) >= -90 && Number(value[0]) <= 90 &&
    Number(value[1]) >= -180 && Number(value[1]) <= 180;
}
const money = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

async function calculateTripFare(pickupCoordinates, dropoffCoordinates) {
  if (!validCoordinates(pickupCoordinates) || !validCoordinates(dropoffCoordinates)) {
    throw new Error('Valid pickup and dropoff coordinates are required');
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
  const estimatedFare = money(BASE_FARE + distanceKm * PRICE_PER_KM);
  const minimumFare = money(Math.max(BASE_FARE, estimatedFare * MIN_FARE_PERCENT / 100));
  return { distanceKm, estimatedFare, minimumFare, currency: 'LYD' };
}
module.exports = { calculateTripFare, validCoordinates };
