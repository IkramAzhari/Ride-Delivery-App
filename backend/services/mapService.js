// backend/services/mapService.js

const axios = require('axios');

// Geoapify Directions API key (add this in your .env file as GEOAPIFY_API_KEY=your_key_here)
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

/**
 * Get route and distance between two locations using Geoapify Directions API.
 * @param {Object} params
 * @param {Array} params.start - [longitude, latitude]
 * @param {Array} params.end - [longitude, latitude]
 * @returns {Object} route details including geometry, distance, duration
 */
async function getRoute({ start, end }) {
  // Format: waypoints=lat1,lon1|lat2,lon2
  const url = `https://api.geoapify.com/v1/routing?waypoints=${start[1]},${start[0]}|${end[1]},${end[0]}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Unable to get route from Geoapify');
  }
}

/**
 * Convert a text address to [longitude, latitude].
 * Accepts "lng,lat" directly, otherwise uses Geoapify Geocoding.
 */
async function geocode(text) {
  const parts = String(text).split(',').map(Number);
  if (parts.length === 2 && parts.every((n) => !Number.isNaN(n))) {
    return parts;
  }
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const response = await axios.get(url);
    const feature = response.data.features[0];

    if (!feature) throw new Error('Address not found');

    return feature.geometry.coordinates;
  } catch (error) {
    throw new Error('Unable to geocode address');
  }
}
const MINIMUM_FARE = 10; // Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ø¨Ø§Ù„Ø¯ÙŠÙ†Ø§Ø± Ø§Ù„Ù„ÙŠØ¨ÙŠ
const PRICE_PER_KM = 1.5; // Ø³Ø¹Ø± ØªØ¬Ø±ÙŠØ¨ÙŠ Ù„ÙƒÙ„ ÙƒÙŠÙ„ÙˆÙ…ØªØ±

/**
 * Simple fare calculation based on distance.
 * @param {number} distance - in meters
 * @returns {number} fare in LYD
 */
function calculateFare(distance) {
  // ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ù…Ø³Ø§ÙØ© Ù…Ù† Ù…ØªØ± Ø¥Ù„Ù‰ ÙƒÙŠÙ„ÙˆÙ…ØªØ±
  const distanceKm = distance / 1000;

  // Ø­Ø³Ø§Ø¨ Ø§Ù„Ø³Ø¹Ø± Ø­Ø³Ø¨ Ø§Ù„Ù…Ø³Ø§ÙØ©
  const fare = distanceKm * PRICE_PER_KM;

  // Ù…Ù†Ø¹ Ø§Ù„Ø³Ø¹Ø± Ù…Ù† Ø§Ù„Ù†Ø²ÙˆÙ„ Ø¹Ù† 10 Ø¯Ù†Ø§Ù†ÙŠØ±
  return Math.max(
    MINIMUM_FARE,
    Math.ceil(fare * 100) / 100
  );
}

/**
 * Check that a customer's offer is not below the distance-based fare.
 * @param {number} offer - offered price in LYD
 * @param {number} distance - in meters
 * @returns {{ valid: boolean, minPrice: number }}
 */
function validateOffer(offer, distance) {
  const minPrice = calculateFare(distance);
  const valid = typeof offer === 'number' && offer >= minPrice;
  return { valid, minPrice };
}

module.exports = {
  getRoute,
  calculateFare,
  validateOffer,
  geocode
};

