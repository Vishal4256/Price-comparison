const userAgentProvider = require('./UserAgentProvider');
const logger = require('../../utils/logger');

class AntiBotManager {
  getRandomViewport() {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 1440, height: 900 }
    ];
    return viewports[Math.floor(Math.random() * viewports.length)];
  }

  async simulateHumanInteraction(page) {
    try {
      // 1. Random Mouse Movements
      const width = page.viewportSize().width;
      const height = page.viewportSize().height;
      
      await page.mouse.move(
        Math.random() * width,
        Math.random() * height,
        { steps: 5 }
      );

      // 2. Random slight scroll
      await page.evaluate(() => {
        window.scrollBy({
          top: Math.random() * 500,
          behavior: 'smooth'
        });
      });

      // 3. Natural delay
      await this.randomDelay(500, 1500);

    } catch (err) {
      logger.warn(`[AntiBotManager] Failed to simulate interaction: ${err.message}`);
    }
  }

  async randomDelay(min = 1000, max = 3000) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getBrowserOptions() {
    return {
      userAgent: userAgentProvider.getRandom(),
      viewport: this.getRandomViewport()
    };
  }
}

module.exports = new AntiBotManager();
