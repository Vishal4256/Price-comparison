const logger = require('../utils/logger');

// Thresholds for state transitions
const CONFIG = {
  CONSECUTIVE_FAILURES_FOR_DEGRADED: 3,
  CONSECUTIVE_FAILURES_FOR_DISABLED: 10,
  RECOVERY_TIMEOUT_MS: 30 * 60 * 1000 // 30 mins before trying to recover
};

class HealthMonitor {
  constructor() {
    // In-memory store for scraper health state.
    // Can be moved to Redis for multi-instance deployments.
    this.states = new Map();
  }

  getScraperState(retailerId) {
    if (!this.states.has(retailerId)) {
      this.states.set(retailerId, {
        status: 'HEALTHY',
        successRate: 100,
        consecutiveFailures: 0,
        totalRuns: 0,
        totalSuccesses: 0,
        lastSuccessAt: null,
        lastErrorAt: null,
        lastErrorMessage: null,
        disabledUntil: null
      });
    }
    return this.states.get(retailerId);
  }

  isAvailable(retailerId) {
    const state = this.getScraperState(retailerId);
    
    if (state.status === 'DISABLED') {
      // Check if we can transition to RECOVERING
      if (state.disabledUntil && Date.now() >= state.disabledUntil) {
        logger.info(`[HealthMonitor] ${retailerId} transitioning from DISABLED to RECOVERING.`);
        state.status = 'RECOVERING';
        return true; // Let it attempt a scrape
      }
      return false; // Still disabled
    }
    
    return true; // HEALTHY, DEGRADED, or RECOVERING
  }

  recordSuccess(retailerId, durationMs) {
    const state = this.getScraperState(retailerId);
    
    state.totalRuns++;
    state.totalSuccesses++;
    state.consecutiveFailures = 0;
    state.lastSuccessAt = new Date();
    state.successRate = (state.totalSuccesses / state.totalRuns) * 100;
    
    if (state.status === 'DEGRADED' || state.status === 'RECOVERING') {
      logger.info(`[HealthMonitor] ${retailerId} stabilized. Transitioning to HEALTHY.`);
      state.status = 'HEALTHY';
    }
  }

  recordFailure(retailerId, errorMessage) {
    const state = this.getScraperState(retailerId);
    
    state.totalRuns++;
    state.consecutiveFailures++;
    state.lastErrorAt = new Date();
    state.lastErrorMessage = errorMessage;
    state.successRate = (state.totalSuccesses / state.totalRuns) * 100;

    if (state.status === 'RECOVERING') {
      // If it fails during recovery, instantly disable it again, double the timeout
      logger.warn(`[HealthMonitor] ${retailerId} failed during RECOVERING. Disabling again.`);
      state.status = 'DISABLED';
      state.disabledUntil = Date.now() + (CONFIG.RECOVERY_TIMEOUT_MS * 2);
    } 
    else if (state.consecutiveFailures >= CONFIG.CONSECUTIVE_FAILURES_FOR_DISABLED && state.status !== 'DISABLED') {
      logger.error(`[HealthMonitor] ${retailerId} exceeded failure limit. Transitioning to DISABLED.`);
      state.status = 'DISABLED';
      state.disabledUntil = Date.now() + CONFIG.RECOVERY_TIMEOUT_MS;
    } 
    else if (state.consecutiveFailures >= CONFIG.CONSECUTIVE_FAILURES_FOR_DEGRADED && state.status === 'HEALTHY') {
      logger.warn(`[HealthMonitor] ${retailerId} is experiencing failures. Transitioning to DEGRADED.`);
      state.status = 'DEGRADED';
    }
  }

  getSnapshot() {
    const snapshot = {};
    for (const [retailer, state] of this.states.entries()) {
      snapshot[retailer] = { ...state };
    }
    return snapshot;
  }
}

module.exports = new HealthMonitor();
