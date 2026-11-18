const ProductFeedJob = require('../../models/ProductFeedJob');
const Product = require('../../models/Product');
const FeedValidator = require('./FeedValidator');
const logger = require('../../utils/logger');

class FeedImporter {
  /**
   * Process a feed job asynchronously
   * @param {string} jobId 
   * @param {Array} parsedData - In a real app, this would be a stream from the fileUrl
   */
  async processJobAsync(jobId, parsedData) {
    try {
      await ProductFeedJob.findByIdAndUpdate(jobId, { status: 'PROCESSING', progress: 10 });

      let imported = 0;
      let rejected = 0;
      let validationErrors = [];

      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        
        // 1. Validate
        const validation = FeedValidator.validateRow(row, i + 1);
        validationErrors = [...validationErrors, ...validation.errors];

        if (!validation.isValid) {
          rejected++;
          continue;
        }

        // 2. Import (Upsert logic simplified for mock)
        try {
          // Normally we map merchant fields to standard Product Schema and upsert
          imported++;
        } catch (err) {
          rejected++;
          validationErrors.push({ row: i + 1, severity: 'FATAL', message: 'DB Insert Error' });
        }

        // Update progress every 100 items (skipped here since mock array is small)
      }

      await ProductFeedJob.findByIdAndUpdate(jobId, {
        status: 'COMPLETED',
        progress: 100,
        importedRecords: imported,
        rejectedRecords: rejected,
        validationErrors,
        completedAt: new Date()
      });

      logger.info(`Feed Job ${jobId} completed. Imported: ${imported}, Rejected: ${rejected}`);

    } catch (error) {
      logger.error(`Feed Job ${jobId} failed: ${error.message}`);
      await ProductFeedJob.findByIdAndUpdate(jobId, {
        status: 'FAILED',
        validationErrors: [{ row: 0, severity: 'FATAL', message: error.message }],
        completedAt: new Date()
      });
    }
  }
}

module.exports = new FeedImporter();
