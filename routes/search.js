const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/search - Full-text search WITH IMAGE PATHS
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        const searchQuery = req.query.q;
        
        if (!searchQuery || searchQuery.trim() === '') {
            return res.json([]);
        }
        
        const cleanQuery = searchQuery.trim();
        
        //Searching subject, location, description, price, spaces(availability)
        //The aggregation is used to convert price and spaces to string for regex matching
        const results = await db.collection('lessons').aggregate([
            {
                $match:{
                    $or: [
                        { subject: { $regex: cleanQuery, $options: 'i' } },
                        { location: { $regex: cleanQuery, $options: 'i' } },
                        { description: { $regex: cleanQuery, $options: 'i' } },
                        { $expr: { $regexMatch: { input: { $toString: "$price" }, regex: cleanQuery, options: "i" } } },
                        { $expr: { $regexMatch: { input: { $toString: "$spaces" }, regex: cleanQuery, options: "i" } } }
                    ]
                
                }
            }
        ]).toArray();
        
        // Add full image URL to search results
        const resultsWithImagePaths = results.map(lesson => ({
            ...lesson,
            imageUrl: `${getBaseUrl(req)}/images/${lesson.image}`
        }));
        
        res.json(resultsWithImagePaths);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Helper function to get base URL
function getBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}`;
}

module.exports = router;