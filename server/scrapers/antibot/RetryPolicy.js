const logger = require('../../utils/logger');
const snapshotService = require('../monitoring/SnapshotService');

class RetryableError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'RetryableError';
    this.originalError = originalError;
  }
}

class NonRetryableError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NonRetryableError';
    this.originalError = originalError;
  }
}

class RetryPolicy {
  constructor() {
    this.MAX_RETRIES = parseInt(process.env.SCRAPER_MAX_RETRIES) || 3;
    this.BASE_DELAY_MS = 2000;
  }

  classifyError(error, pageContent = '') {
    const msg = error.message.toLowerCase();
    
    // CAPTCHA Detection
    if (
      msg.includes('captcha') || 
      pageContent.includes('Enter the characters you see below') ||
      pageContent.includes('robot')
    ) {
      return new NonRetryableError('CAPTCHA detected', error);
    }

    if (msg.includes('timeout') || msg.includes('navigation') || msg.includes('net::')) {
      return new RetryableError('Network or Navigation Timeout', error);
    }

    // Default to non-retryable for selector errors if we suspect layout changes
    return new NonRetryableError('Scrape parsing or structural failure', error);
  }

  async withRetry(operationName, retailerId, page, operationFn) {
    let attempt = 1;
    
    while (attempt <= this.MAX_RETRIES) {
      try {
        return await operationFn();
      } catch (error) {
        // Attempt to extract page content for better classification
        let html = '';
        try { if (page && !page.isClosed()) html = await page.content(); } catch (e) {}

        const classifiedError = this.classifyError(error, html);

        logger.warn(`[RetryPolicy] ${operationName} failed (Attempt ${attempt}/${this.MAX_RETRIES}): ${classifiedError.message}`);

        if (classifiedError instanceof NonRetryableError || attempt === this.MAX_RETRIES) {
          // Take snapshot on terminal failure
          if (page && !page.isClosed()) {
            await snapshotService.takeSnapshot(retailerId, page, classifiedError, attempt);
          }
          throw classifiedError;
        }

        // Exponential backoff
        const delayMs = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
        logger.info(`[RetryPolicy] Backing off for ${delayMs}ms before retry...`);
        await new Promise(r => setTimeout(r, delayMs));

        attempt++;
      }
    }
  }
}

module.exports = { RetryPolicy: new RetryPolicy(), RetryableError, NonRetryableError };
