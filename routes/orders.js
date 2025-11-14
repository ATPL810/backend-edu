const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { getDatabase } = require('../config/database');

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const db = getDatabase();
        const { name, phone, lessons, email } = req.body;
        
        if (!name || !phone || !lessons || !Array.isArray(lessons)) {
            return res.status(400).json({ 
                error: 'Name, phone, and lessons array are required' 
            });
        }
        
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name.trim())) {
            return res.status(400).json({ error: 'Name must contain only letters and spaces' });
        }
        
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(phone.trim())) {
            return res.status(400).json({ error: 'Phone must contain only numbers (min 10 digits)' });
        }
        
        if (lessons.length === 0) {
            return res.status(400).json({ error: 'Lessons array cannot be empty' });
        }
        
        for (const lesson of lessons) {
            if (!lesson.lessonId || !ObjectId.isValid(lesson.lessonId)) {
                return res.status(400).json({ error: 'Invalid lesson ID in lessons array' });
            }
        }
        
        const newOrder = {
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : '',
            lessons: lessons.map(lesson => ({
                lessonId: new ObjectId(lesson.lessonId),
                subject: lesson.subject,
                price: lesson.price,
                // Store image for cart display
                image: lesson.image, 
                quantity: lesson.quantity || 1
            })),
            total: req.body.total || lessons.reduce((sum, lesson) => sum + (lesson.price * (lesson.quantity || 1)), 0),
            orderDate: new Date(),
            status: 'confirmed'
        };
        
        const result = await db.collection('orders').insertOne(newOrder);
        
        // Update lesson spaces
        const updatePromises = newOrder.lessons.map(item => 
            db.collection('lessons').updateOne(
                { _id: item.lessonId },
                { $inc: { spaces: -item.quantity } }
            )
        );
        
        await Promise.all(updatePromises);

        console.log("the new order  "+newOrder);
        
        res.status(201).json({ 
            orderId: result.insertedId,
            message: 'Order created successfully',
            total: newOrder.total
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ error: 'Failed to create order' });
    }
});

// Delete an order and restores lessons spaces
router.delete('/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const orderId = req.params.id;

        // Validate order ID
        if (!ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        // Find the order first to get lesson information for restoring spaces
        const order = await db.collection('orders').findOne({ 
            _id: new ObjectId(orderId) 
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Restore lesson spaces before deleting the order
        const restorePromises = order.lessons.map(item => 
            db.collection('lessons').updateOne(
                { _id: item.lessonId },
                { $inc: { spaces: item.quantity } }
            )
        );

        await Promise.all(restorePromises);

        // Delete the order
        const result = await db.collection('orders').deleteOne({ 
            _id: new ObjectId(orderId) 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ 
            message: 'Order deleted successfully',
            deletedOrderId: orderId,
            restoredLessons: order.lessons.length
        });

    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        const orders = await db.collection('orders')
            .find({})
            .sort({ orderDate: -1 })
            .toArray();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

module.exports = router;