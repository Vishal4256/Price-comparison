const visionEngine = require('../services/visionEngine');

exports.searchByImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { code: 'MISSING_FILE', message: 'No image uploaded' } });
        }

        const buffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        const result = await visionEngine.extractFromImage(buffer, mimeType);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.searchByBarcode = async (req, res, next) => {
    try {
        const { barcode } = req.body;
        
        if (!barcode) {
            return res.status(400).json({ success: false, error: { code: 'MISSING_BARCODE', message: 'No barcode provided' } });
        }

        const result = await visionEngine.extractFromBarcode(barcode);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};
