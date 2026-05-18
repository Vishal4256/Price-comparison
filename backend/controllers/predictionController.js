const { spawn } = require('child_process');
const path = require('path');
const Price = require('../models/Price');
const Product = require('../models/Product');

// @desc  Get AI price prediction for product
// @route GET /api/prediction/:productId
const getPrediction = async (req, res) => {
  try {
    const { productId } = req.params;
    const { website } = req.query;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const filter = { productId };
    if (website) filter.website = website;

    const history = await Price.find(filter).sort({ timestamp: 1 }).limit(90);

    if (history.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Not enough price history for prediction (need at least 3 data points)',
      });
    }

    // Call Python script for AI prediction
    const pythonScript = path.join(__dirname, '../ai/predictor.py');
    const py = spawn('python', [pythonScript]);

    let dataString = '';
    py.stdin.write(JSON.stringify({ history }));
    py.stdin.end();

    py.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    py.on('close', (code) => {
      try {
        if (code !== 0) {
          throw new Error(`Python process exited with code ${code}`);
        }
        const prediction = JSON.parse(dataString);
        if (prediction.error) {
          throw new Error(prediction.error);
        }

        res.json({
          success: true,
          product: { id: product._id, name: product.name, image: product.image },
          prediction,
          dataPoints: history.length,
          model: 'Scikit-learn LinearRegression'
        });
      } catch (err) {
        console.error('Prediction Engine Error:', err.message);
        res.status(500).json({ success: false, message: 'Prediction engine failure: ' + err.message });
      }
    });

    py.on('error', (err) => {
      console.error('Python Spawn Error:', err);
      res.status(500).json({ success: false, message: 'Could not start prediction engine' });
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPrediction };
