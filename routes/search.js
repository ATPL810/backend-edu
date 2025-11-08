const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/search - Full-text search
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        const searchQuery = req.query.q;
        
        if (!searchQuery || searchQuery.trim() === '') {
            return res.json([]);
        }
        
        // Create search pattern for case-insensitive search
        const searchPattern = new RegExp(searchQuery, 'i');
        
        // Search across multiple fields
        const results = await db.collection('lessons').find({
            $or: [
                { subject: { $regex: searchPattern } },
                { location: { $regex: searchPattern } },
                { description: { $regex: searchPattern } },
                { price: { $regex: searchPattern } },
                { spaces: { $regex: searchPattern } }
            ]
        }).toArray();
        
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;