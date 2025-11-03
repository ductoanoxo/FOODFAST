/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param {number} lat1 Latitude of the first point.
 * @param {number} lon1 Longitude of the first point.
 * @param {number} lat2 Latitude of the second point.
 * @param {number} lon2 Longitude of the second point.
 * @returns {number} The distance in kilometers.
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculates the delivery fee based on the distance.
 * @param {number} distanceInKm The distance in kilometers.
 * @returns {number} The calculated delivery fee.
 */
function calculateDeliveryFee(distanceInKm) {
  const BASE_FEE = 15000; // 15,000 VND
  const BASE_DISTANCE = 2; // 2 km
  const FEE_PER_KM = 5000; // 5,000 VND per km

  if (distanceInKm <= BASE_DISTANCE) {
    return BASE_FEE;
  }

  const additionalDistance = distanceInKm - BASE_DISTANCE;
  const additionalFee = Math.ceil(additionalDistance) * FEE_PER_KM; // Round up to the next km

  return BASE_FEE + additionalFee;
}

module.exports = { getDistanceFromLatLonInKm, calculateDeliveryFee };
