const express = require('express');
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio'); // Assuming Portfolio model is defined in models/Portfolio.js
const router = express.Router();

// Middleware to handle errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Get user's portfolio
router.get('/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.json(portfolio);
}));

// Create or update user's portfolio
router.post('/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { assets } = req.body; // Expecting assets to be an array of asset objects

    if (!Array.isArray(assets)) {
        return res.status(400).json({ message: 'Assets must be an array' });
    }

    const portfolio = await Portfolio.findOneAndUpdate(
        { userId },
        { assets },
        { new: true, upsert: true }
    );

    res.json(portfolio);
}));

// Real-time tracking endpoint (WebSocket or similar can be implemented here)
router.get('/track/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    // Logic for real-time tracking can be implemented here
    // This could involve setting up a WebSocket connection or using a service like Socket.io
    res.json({ message: 'Real-time tracking not implemented yet' });
}));

module.exports = router;