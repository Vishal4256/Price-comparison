const express = require('express');
const router = express.Router();
const Merchant = require('../../models/Merchant');
const ProductFeedJob = require('../../models/ProductFeedJob');
const FeedImporter = require('../../services/merchant/FeedImporter');
const logger = require('../../utils/logger');
const { requireAuth, requirePartner } = require('../../middlewares/auth');

router.get('/dashboard', requireAuth, requirePartner, async (req, res) => {
  try {
    const jobs = await ProductFeedJob.find({ merchantId: req.user.id }).sort('-createdAt').limit(5);
    // Real implementation would calculate these from actual logs/clicks
    res.json({
      data: {
        stats: [
          { title: 'Total Clicks', value: '0', change: '0%', color: 'text-blue-400', bg: 'bg-blue-900/20' },
          { title: 'Active Products', value: '0', change: '0', color: 'text-green-400', bg: 'bg-green-900/20' },
          { title: 'API Requests', value: '0', change: '0', color: 'text-purple-400', bg: 'bg-purple-900/20' }
        ],
        recentFeeds: jobs
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/feeds', requireAuth, requirePartner, async (req, res) => {
  try {
    // 1. Mock parsing the payload (usually req.file via multer)
    const { data } = req.body; 
    const merchantId = req.user.id;
    
    if (!data) {
      return res.status(400).json({ error: 'data required' });
    }

    // 2. Create the Job
    const job = await ProductFeedJob.create({
      merchantId,
      status: 'QUEUED',
      progress: 0
    });

    // 3. Queue Background Processing
    // In production this would be sent to a RabbitMQ/BullMQ queue. 
    // Here we trigger the async function without awaiting it to simulate a worker.
    FeedImporter.processJobAsync(job._id, data).catch(err => {
      logger.error('Background feed processing failed entirely', err);
    });

    // 4. Return immediately
    res.status(202).json({
      message: 'Feed upload accepted and queued for processing',
      jobId: job._id
    });

  } catch (error) {
    logger.error(`Feed upload error: ${error.message}`);
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @swagger
 * /api/v1/partner/feeds/{jobId}:
 *   get:
 *     summary: Check feed job status
 *     tags: [Partner]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status
 */
router.get('/feeds/:jobId', async (req, res) => {
  try {
    const job = await ProductFeedJob.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    res.json({ data: job });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
