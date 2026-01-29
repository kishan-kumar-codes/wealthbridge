const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio'); // Assuming Portfolio model is defined in models/Portfolio.js
const axios = require('axios');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
};

// Fetch real-time portfolio data
router.get('/:userId', isAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const portfolio = await Portfolio.findOne({ userId });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        // Fetch real-time data for each asset in the portfolio
        const assetDataPromises = portfolio.assets.map(async (asset) => {
            const response = await axios.get(`https://api.example.com/asset/${asset.symbol}`);
            return {
                symbol: asset.symbol,
                quantity: asset.quantity,
                price: response.data.price,
                value: response.data.price * asset.quantity,
            };
        });

        const assetData = await Promise.all(assetDataPromises);
        const totalValue = assetData.reduce((acc, asset) => acc + asset.value, 0);

        return res.status(200).json({ portfolio: assetData, totalValue });
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Update portfolio asset
router.put('/:userId/update', isAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { symbol, quantity } = req.body;

        const portfolio = await Portfolio.findOneAndUpdate(
            { userId, 'assets.symbol': symbol },
            { $set: { 'assets.$.quantity': quantity } },
            { new: true }
        );

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio or asset not found' });
        }

        return res.status(200).json({ message: 'Portfolio updated successfully', portfolio });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;