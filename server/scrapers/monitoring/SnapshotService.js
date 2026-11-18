const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class SnapshotService {
  constructor() {
    this.snapshotBaseDir = path.join(__dirname, '../../../snapshots');
  }

  async _ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
  }

  async takeSnapshot(retailerId, page, error, retryAttempt) {
    try {
      // 1. Create directory structure: snapshots/<retailer>/<timestamp>/
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const dirPath = path.join(this.snapshotBaseDir, retailerId, timestamp);
      await this._ensureDir(dirPath);

      // 2. Save Screenshot
      const screenshotPath = path.join(dirPath, 'screenshot.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // 3. Save HTML
      const htmlPath = path.join(dirPath, 'page.html');
      const html = await page.content();
      await fs.writeFile(htmlPath, html, 'utf-8');

      // 4. Save Metadata
      const metadataPath = path.join(dirPath, 'metadata.json');
      const metadata = {
        retailer: retailerId,
        url: page.url(),
        timestamp: new Date().toISOString(),
        errorType: error.name,
        message: error.message,
        userAgent: await page.evaluate(() => navigator.userAgent).catch(() => 'unknown'),
        viewport: page.viewportSize(),
        retryAttempt
      };
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

      logger.info(`[SnapshotService] Captured diagnostic snapshot at: ${dirPath}`);
    } catch (err) {
      logger.error(`[SnapshotService] Failed to capture snapshot: ${err.message}`);
    }
  }
}

module.exports = new SnapshotService();
