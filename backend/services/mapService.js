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
 * Simple fare calculation based on distance.
 * @param {number} distance - in meters
 * @returns {number} fare in INR
 */
function calculateFare(distance) {
  // Example: ₹50 base + ₹15/km
  return 50 + Math.round((distance / 1000) * 15);
}

module.exports = {
  getRoute,
  calculateFare
};
