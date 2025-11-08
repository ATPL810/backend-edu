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

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        requestedUrl: req.originalUrl 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
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
            console.log(`API available at http://localhost:${PORT}/api`);
            console.log(`Images available at http://localhost:${PORT}/images`);
            console.log(`Health check at http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;