const multer = require('multer');

// Configure Memory Storage
const storage = multer.memoryStorage();

// File validation
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('INVALID_FILE_TYPE'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
    fileFilter: fileFilter
});

// Middleware wrapper for catching Multer errors cleanly
const uploadMiddleware = (req, res, next) => {
    const singleUpload = upload.single('image');

    singleUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, error: { code: 'FILE_TOO_LARGE', message: 'File is too large. Maximum size is 5MB.' } });
            }
            return res.status(400).json({ success: false, error: { code: 'UPLOAD_ERROR', message: err.message } });
        } else if (err) {
            if (err.message === 'INVALID_FILE_TYPE') {
                return res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only JPEG, PNG, and WebP images are supported.' } });
            }
            return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
        }
        
        // No errors
        next();
    });
};

module.exports = uploadMiddleware;
