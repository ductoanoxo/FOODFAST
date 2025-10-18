const express = require('express');
const router = express.Router();
const asyncHandler = require('../Middleware/asyncHandler');
const mapService = require('../Utils/mapService');

// @desc    Geocode address to coordinates
// @route   GET /api/map/geocode
// @access  Public
router.get('/geocode', asyncHandler(async(req, res) => {
    const { address } = req.query;

    if (!address) {
        res.status(400);
        throw new Error('Address is required');
    }

    const result = await mapService.geocode(address);

    res.json({
        success: true,
        data: result
    });
}));

// @desc    Reverse geocode coordinates to address
// @route   GET /api/map/reverse-geocode
// @access  Public
router.get('/reverse-geocode', asyncHandler(async(req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        res.status(400);
        throw new Error('Latitude and longitude are required');
    }

    const result = await mapService.reverseGeocode(
        parseFloat(lat),
        parseFloat(lng)
    );

    res.json({
        success: true,
        data: result
    });
}));

// @desc    Calculate distance between two points
// @route   GET /api/map/distance
// @access  Public
router.get('/distance', asyncHandler(async(req, res) => {
    const { originLat, originLng, destLat, destLng } = req.query;

    if (!originLat || !originLng || !destLat || !destLng) {
        res.status(400);
        throw new Error('Origin and destination coordinates are required');
    }

    const result = await mapService.getDistance({ lat: parseFloat(originLat), lng: parseFloat(originLng) }, { lat: parseFloat(destLat), lng: parseFloat(destLng) });

    res.json({
        success: true,
        data: result
    });
}));

// @desc    Autocomplete place search (Goong only)
// @route   GET /api/map/autocomplete
// @access  Public
router.get('/autocomplete', asyncHandler(async(req, res) => {
    const { input, lat, lng } = req.query;

    if (!input) {
        res.status(400);
        throw new Error('Search input is required');
    }

    const location = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
    const results = await mapService.autocomplete(input, location);

    res.json({
        success: true,
        count: results.length,
        data: results
    });
}));

// @desc    Get place details by place_id (Goong only)
// @route   GET /api/map/place/:placeId
// @access  Public
router.get('/place/:placeId', asyncHandler(async(req, res) => {
    const { placeId } = req.params;

    const result = await mapService.getPlaceDetails(placeId);

    res.json({
        success: true,
        data: result
    });
}));

module.exports = router;