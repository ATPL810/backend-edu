const path = require('path');
const fs = require('fs');

const staticFileMiddleware = (req, res, next) => {
    // It handles only resquests to /images/* and not others
    if (req.url.startsWith('/images/')) {
        const imagePath = path.join(__dirname, '../images', path.basename(req.url));
        
        // .access checks if file exists in the disk and .constants if file exists
        fs.access(imagePath, fs.constants.F_OK, (err) => {
            if (err) {
                // If ile doesn't exist, it returns default image or error
                console.log(`Image not found: ${req.url}`);
                res.status(404).json({
                    error: 'Image not found',
                    message: `The requested image ${req.url} does not exist`,
                    suggestedImages: ['chemsitry.jpg','physics.jpg','maths.jpg', 'biology.jpg', 'maths.jpg', 'english.jpg', 'history.jpg', 'music.jpg','science.jpg', 'programming.jpg']
                });
            } else {
                // File exists, lets express.static handle it
                next();
            }
        });
    } else {
        next();
    }
};

module.exports = staticFileMiddleware;