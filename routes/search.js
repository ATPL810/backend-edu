const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/search - Full-text search WITH IMAGE PATHS
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        //gets the request from the query parameter 'q' in the url
        const searchQuery = req.query.q;
        
        if (!searchQuery || searchQuery.trim() === '') {
            return res.json([]);
        }
        // Cleans the code if there are any trailing spaces
        const cleanQuery = searchQuery.trim();
        
        //The aggregation is used for unified search across multiple fields and eases conversion of data types
        //multi-field search with regex for case-insensitive matching
        const results = await db.collection('lessons').aggregate([
            {
                // It is like a WHERE statement in sql that can be used in aggregation 
                $match:{
                    //it will filter the documents according to the field values
                    $or: [
                        //options 'i' makes the search case-insensitive. 
                        //it finds partial matches in the fields. e.g., "mat" will match "Mathematics","maths"
                        { subject: { $regex: cleanQuery, $options: 'i' } },
                        { location: { $regex: cleanQuery, $options: 'i' } },
                        { description: { $regex: cleanQuery, $options: 'i' } },
                        { $expr: { $regexMatch: { input: { $toString: "$price" }, regex: cleanQuery, options: "i" } } },
                        { $expr: { $regexMatch: { input: { $toString: "$spaces" }, regex: cleanQuery, options: "i" } } }
                        //expr for complex expressions
                        //regexMatch performs regex search which can be any expression
                        //regex used for only variables and used for search where it looks for patterns
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

// Helper function to get base URL which is dynamic( not hardcoded)
function getBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}`;
}

module.exports = router;