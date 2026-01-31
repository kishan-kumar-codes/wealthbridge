const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio'); // Assuming Portfolio model is defined in models/Portfolio.js
const { getRealTimeData } = require('../services/realTimeService'); // Assuming a service to fetch real-time data

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
};

// Route to get user's portfolio
router.get('/:userId', isAuthenticated, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.params.userId });
        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }
        return res.status(200).json(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update user's portfolio in real-time
router.post('/:userId/update', isAuthenticated, async (req, res) => {
    const { assets } = req.body;
    if (!assets || !Array.isArray(assets)) {
        return res.status(400).json({ message: 'Invalid assets data' });
    }

    try {
        const portfolio = await Portfolio.findOneAndUpdate(
            { userId: req.params.userId },
            { assets },
            { new: true, runValidators: true }
        );

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        // Fetch real-time data for updated assets
        const realTimeData = await getRealTimeData(assets);
        return res.status(200).json({ portfolio, realTimeData });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete user's portfolio
router.delete('/:userId', isAuthenticated, async (req, res) => {
    try {
        const result = await Portfolio.deleteOne({ userId: req.params.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;