const logger = require('../utils/logger');
const JobExecution = require('../models/JobExecution');

/**
 * Abstract interface for scheduling background tasks.
 * Enables easy swapping between Cron and Queue-based (Redis/BullMQ) systems.
 */
class JobScheduler {
  constructor() {
    if (this.constructor === JobScheduler) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Registers a job to be executed on a specific schedule.
   * @param {string} name Unique name of the job
   * @param {string} schedule Cron expression
   * @param {Function} handler Async function to execute
   */
  schedule(name, schedule, handler) {
    throw new Error("Method 'schedule()' must be implemented.");
  }

  /**
   * Start the scheduler.
   */
  start() {
    throw new Error("Method 'start()' must be implemented.");
  }

  /**
   * Gracefully stop the scheduler and wait for active jobs to finish.
   */
  async stop() {
    throw new Error("Method 'stop()' must be implemented.");
  }

  /**
   * Helper to execute a job and log its execution metadata.
   */
  async executeJob(name, handler) {
    logger.info(`[Job: ${name}] Starting...`);
    const startTime = Date.now();
    let status = 'COMPLETED';
    let errorMessage = null;
    let result = { processedItems: 0, errors: 0 };

    try {
      result = await handler();
    } catch (err) {
      status = 'FAILED';
      errorMessage = err.message;
      logger.error(`[Job: ${name}] Failed: ${err.message}`);
    }

    const durationMs = Date.now() - startTime;
    logger.info(`[Job: ${name}] Finished in ${durationMs}ms [${status}]`);

    try {
      await JobExecution.create({
        jobName: name,
        startedAt: new Date(startTime),
        finishedAt: new Date(),
        durationMs,
        status,
        processedItems: result?.processedItems || 0,
        errors: result?.errors || 0,
        errorMessage
      });
    } catch (logErr) {
      logger.error(`[Job: ${name}] Failed to save execution log: ${logErr.message}`);
    }
  }
}

module.exports = JobScheduler;
