const express = require('express');
const router = express.Router();
const Merchant = require('../../models/Merchant');
const ProductFeedJob = require('../../models/ProductFeedJob');
const FeedImporter = require('../../services/merchant/FeedImporter');
const logger = require('../../utils/logger');
// Mock middleware, in production this would verify JWT and req.user.role === 'partner'

/**
 * @swagger
 * /api/v1/partner/feeds:
 *   post:
 *     summary: Upload a new product feed
 *     tags: [Partner]
 *     responses:
 *       202:
 *         description: Job Queued
 */
router.post('/feeds', async (req, res) => {
  try {
    // 1. Mock parsing the payload (usually req.file via multer)
    const { merchantId, data } = req.body; 
    
    if (!merchantId || !data) {
      return res.status(400).json({ error: 'merchantId and data required' });
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
