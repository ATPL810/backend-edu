const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/lessons - Get all lessons WITH FULL IMAGE PATHS
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        const lessons = await db.collection('lessons').find({}).toArray();
        
        // Add full image URL to each lesson
        const lessonsWithImagePaths = lessons.map(lesson => ({
            ...lesson,
            imageUrl: `${getBaseUrl(req)}/images/${lesson.image}`
        }));
        
        res.json(lessonsWithImagePaths);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});

// GET /api/lessons/:id - Get lesson by ID WITH FULL IMAGE PATH
router.get('/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid lesson ID format' });
        }

        const db = getDatabase();
        const lesson = await db.collection('lessons').findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        // Add full image URL
        const lessonWithImagePath = {
            ...lesson,
            imageUrl: `${getBaseUrl(req)}/images/${lesson.image}`
        };
        
        res.json(lessonWithImagePath);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ error: 'Failed to fetch lesson' });
    }
});

// PUT /api/lessons/:id - Update lesson
router.put('/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid lesson ID format' });
        }
        //Here 6 fields can be modified
        const db = getDatabase();
        const allowedUpdates = ['subject', 'location', 'price', 'spaces', 'image', 'description'];
        const updates = Object.keys(req.body);
        //Error check if any field is not allowed
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).json({ 
                error: 'Invalid updates',
                allowedFields: allowedUpdates 
            });
        }
        //If no fields to update
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        // Form requests each field to update
        const updateFields = {};
        updates.forEach(field => {
            updateFields[field] = req.body[field];
        });
        // The update operation is being done here if all criteria are met
        const result = await db.collection('lessons').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );
        
        // if (result.value) {
        //     return res.json({ result, Success: 'Lesson successfully updated' });
        // }
        
        // Add full image URL to updated lesson
        const updatedLessonWithImagePath = {
            ...result.value,
            imageUrl: `${getBaseUrl(req)}/images/${result.value.image}`
        };
        
        res.json({
            success: true,
            message: 'Lesson successfully updated',
            data: updatedLessonWithImagePath
        });
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(400).json({ error: 'Failed to update lesson' });
    }
});

// POST /api/lessons - Create new lesson
router.post('/', async (req, res) => {
    try {
        const db = getDatabase();
        
        const { subject, location, price } = req.body;
        if (!subject || !location || !price) {
            return res.status(400).json({ error: 'Subject, location, and price are required' });
        }
        
        const newLesson = {
            subject: subject.trim(),
            location: location.trim(),
            price: Number(price),
            spaces: req.body.spaces || 5,
            image: req.body.image || 'default.jpg',
            description: req.body.description || '',
            createdAt: new Date()
        };
        
        const result = await db.collection('lessons').insertOne(newLesson);
        
        // Add full image URL to new lesson
        const newLessonWithImagePath = {
            ...newLesson,
            _id: result.insertedId,
            imageUrl: `${getBaseUrl(req)}/images/${newLesson.image}`
        };
        
        res.status(201).json(newLessonWithImagePath);
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(400).json({ error: 'Failed to create lesson' });
    }
});

// Helper function to get base URL
function getBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}`;
}

module.exports = router;