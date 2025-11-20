// Loading the environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToDatabase } = require('./config/database');

// Import middleware
const logger = require('./middleware/logger');
const staticFileMiddleware = require('./middleware/staticFiles');

// Import routes
const lessonRoutes = require('./routes/lessons');
const orderRoutes = require('./routes/orders');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Serve static files from images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Use custom static file middleware for additional functionality
app.use(staticFileMiddleware);

// Routes
app.use('/api/lessons', lessonRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Course Booking API is running!',
        endpoints: {
            lessons: 'GET /api/lessons',
            orders: 'POST /api/orders',
            search: 'GET /api/search?q=query',
            update_lesson: 'PUT /api/lessons/:id',
            images: 'GET /images/filename.jpg'
        },
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
//  CORRECT - Use a proper 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `The route ${req.method} ${req.originalUrl} does not exist`,
        availableEndpoints: [
            'GET /api/lessons',
            'POST /api/orders', 
            'GET /api/search?q=query',
            'PUT /api/lessons/:id',
            'GET /health'
        ]
    });
});


// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message : 'Internal server error'
    });
});

// Initialize server
const startServer = async () => {
    try {
        // Connect to database first
        await connectToDatabase();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at /api/lessons`);
            console.log(`Images available at /images`);
            console.log(`Health check at /health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;