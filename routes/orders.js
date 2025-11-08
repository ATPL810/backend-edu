const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const db = getDatabase();
        const { MongoClient } = require('mongodb');
        
        // Validate required fields
        const { name, phone, lessons, email } = req.body;
        
        if (!name || !phone || !lessons || !Array.isArray(lessons)) {
            return res.status(400).json({ error: 'Name, phone, and lessons array are required' });
        }
        
        // Validate name (letters only)
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ error: 'Name must contain only letters' });
        }
        
        // Validate phone (numbers only)
        const phoneRegex = /^\d+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Phone must contain only numbers' });
        }
        
        const newOrder = {
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : '',
            lessons: lessons.map(lesson => ({
                lessonId: new MongoClient.ObjectId(lesson.lessonId),
                subject: lesson.subject,
                price: lesson.price,
                quantity: lesson.quantity || 1
            })),
            total: req.body.total || lessons.reduce((sum, lesson) => sum + lesson.price, 0),
            orderDate: new Date(),
            status: 'confirmed'
        };
        
        // Insert order
        const result = await db.collection('orders').insertOne(newOrder);
        
        // Update lesson spaces
        for (const item of newOrder.lessons) {
            await db.collection('lessons').updateOne(
                { _id: item.lessonId },
                { $inc: { spaces: -item.quantity } }
            );
        }
        
        res.status(201).json({ 
            ...newOrder, 
            _id: result.insertedId,
            message: 'Order created successfully' 
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ error: 'Failed to create order' });
    }
});

// GET /api/orders - Get all orders (for testing)
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        const orders = await db.collection('orders').find({}).toArray();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

module.exports = router;