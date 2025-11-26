const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { getDatabase } = require('../config/database');

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const db = getDatabase();
        //saves the order details from the request body
        const { name, phone, lessons, email } = req.body;
        
        if (!name || !phone || !lessons || !Array.isArray(lessons)) {
            return res.status(400).json({ 
                error: 'Name, phone, and lessons array are required' 
            });
        }
        
        //regex format validation(A-Za-z(case sensitive) and \s--spaces only) and + for full string match
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name.trim())) {
            return res.status(400).json({ error: 'Name must contain only letters and spaces' });
        }

        // \d{7,8} means 7 to 8 digits only
        const phoneRegex = /^\d{7,8}$/;
        if (!phoneRegex.test(phone.trim())) {
            alert("Phone must contain 7-8 numbers (min 7 digits)");
        }
        //if the lessons array is empty 
        if (lessons.length === 0) {
            return res.status(400).json({ error: 'Lessons array cannot be empty' });
        }
        // validates each lesson object in the lessons array
        for (const lesson of lessons) {
            if (!lesson.lessonId || !ObjectId.isValid(lesson.lessonId)) {
                return res.status(400).json({ error: 'Invalid lesson ID in lessons array' });
            }
        }
        // The new order object to be inserted into the database
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
        
        // Insert the new order into the orders collection
        const result = await db.collection('orders').insertOne(newOrder);
        
        // Updating lesson spaces
        const updatePromises = newOrder.lessons.map(async (item) => {
            try {
                // Getting the current lesson to know current spaces
                const currentLesson = await db.collection('lessons').findOne(
                    { _id: item.lessonId }
                );
                
                if (!currentLesson) {
                    throw new Error(`Lesson ${item.lessonId} not found`);
                }
                
                // Calculate new spaces
                const newSpaces = currentLesson.spaces - item.quantity;
                
                // Updating via PUT API(fetch) for spaces
                const response = await fetch(`${getBaseUrl(req)}/api/lessons/${item.lessonId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ spaces: newSpaces })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Failed to update spaces for lesson ${item.lessonId}:`, error);
                throw error;
            }
        });

        // it waits for all the update operations to complete
        await Promise.all(updatePromises);

        console.log("the new order  "+newOrder);
        
        //success response
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
        const restorePromises = order.lessons.map(async (item) => {
            try {
                // Getting the current lesson to know current spaces
                const currentLesson = await db.collection('lessons').findOne(
                    { _id: item.lessonId }
                );
                
                if (!currentLesson) {
                    throw new Error(`Lesson ${item.lessonId} not found`);
                }
                
                // Calculate new spaces (restore by adding back the quantity)
                const newSpaces = currentLesson.spaces + item.quantity;
                
                // Updates via PUT API for spaces(availability)
                const response = await fetch(`${getBaseUrl(req)}/api/lessons/${item.lessonId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ spaces: newSpaces })
                });
                
                // error handling for fetch response
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }
                
                // returns the updated lesson data
                return await response.json();
            } catch (error) {
                console.error(`Failed to restore spaces for lesson ${item.lessonId}:`, error);
                throw error;
            }
        });

        // it waits for all the restore operations to complete
        await Promise.all(restorePromises);

        // Delete the order by ID
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
             // finds all orders
            .find({})
            // sorts in descending order of orderDate (newest first)
            .sort({ orderDate: -1 })
            .toArray();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Helper function to get base URL
function getBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}`;
}

module.exports = router;