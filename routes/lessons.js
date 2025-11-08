const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/lessons - Get all lessons
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        const lessons = await db.collection('lessons').find({}).toArray();
        res.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});

// GET /api/lessons/:id - Get lesson by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const { MongoClient } = require('mongodb');
        
        const lesson = await db.collection('lessons').findOne({ 
            _id: new MongoClient.ObjectId(req.params.id) 
        });
        
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        res.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ error: 'Failed to fetch lesson' });
    }
});

// PUT /api/lessons/:id - Update lesson (for updating spaces)
router.put('/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const { MongoClient } = require('mongodb');
        
        const allowedUpdates = ['subject', 'location', 'price', 'spaces', 'icon', 'description'];
        const updates = Object.keys(req.body);
        
        // Validate allowed fields
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }
        
        const updateFields = {};
        updates.forEach(field => {
            updateFields[field] = req.body[field];
        });
        
        const result = await db.collection('lessons').findOneAndUpdate(
            { _id: new MongoClient.ObjectId(req.params.id) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );
        
        if (!result.value) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        res.json(result.value);
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(400).json({ error: 'Failed to update lesson' });
    }
});

// POST /api/lessons - Create new lesson (for initial setup)
router.post('/', async (req, res) => {
    try {
        const db = getDatabase();
        
        const newLesson = {
            subject: req.body.subject,
            location: req.body.location,
            price: req.body.price,
            spaces: req.body.spaces || 5,
            icon: req.body.icon || 'fa-music',
            description: req.body.description || '',
            createdAt: new Date()
        };
        
        const result = await db.collection('lessons').insertOne(newLesson);
        res.status(201).json({ ...newLesson, _id: result.insertedId });
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(400).json({ error: 'Failed to create lesson' });
    }
});

module.exports = router;