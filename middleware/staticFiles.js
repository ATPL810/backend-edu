const path = require('path');
const fs = require('fs');

const staticFileMiddleware = (req, res, next) => {
    // Check if request is for an image file that doesn't exist
    if (req.url.startsWith('/images/')) {
        const imagePath = path.join(__dirname, '../images', path.basename(req.url));
        
        // Check if file exists
        fs.access(imagePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File doesn't exist - return default image or error
                console.log(`Image not found: ${req.url}`);
                res.status(404).json({
                    error: 'Image not found',
                    message: `The requested image ${req.url} does not exist`,
                    suggestedImages: ['maths.jpg', 'english.jpg', 'history.jpg', 'science.jpg', 'programming.jpg']
                });
            } else {
                // File exists, let express.static handle it
                next();
            }
        });
    } else {
        next();
    }
};

module.exports = staticFileMiddleware;