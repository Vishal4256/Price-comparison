const cron = require('node-cron');
const JobScheduler = require('./JobScheduler');
const logger = require('../utils/logger');

class CronScheduler extends JobScheduler {
  constructor() {
    super();
    this.activeTasks = [];
    this.runningJobs = new Set();
  }

  schedule(name, schedule, handler) {
    if (this.jobs.has(name)) {
      logger.warn(`Job ${name} is already scheduled.`);
      return;
    }

    this.jobs.set(name, { schedule, handler });

    // Only start scheduling if we are already running
    if (this.isRunning) {
      this._startJob(name, schedule, handler);
    }
  }

  _startJob(name, schedule, handler) {
    const task = cron.schedule(schedule, async () => {
      // Prevent overlapping executions of the same job
      if (this.runningJobs.has(name)) {
        logger.warn(`[Job: ${name}] Skipped: Previous instance is still running.`);
        return;
      }

      this.runningJobs.add(name);
      await this.executeJob(name, handler);
      this.runningJobs.delete(name);
    });

    this.activeTasks.push(task);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Starting CronScheduler...');

    for (const [name, { schedule, handler }] of this.jobs.entries()) {
      this._startJob(name, schedule, handler);
    }
  }

  async stop() {
    if (!this.isRunning) return;
    logger.info('Stopping CronScheduler... waiting for active jobs to finish.');
    
    // Stop accepting new cron ticks
    for (const task of this.activeTasks) {
      task.stop();
    }
    this.activeTasks = [];
    this.isRunning = false;

    // Wait for in-flight jobs to complete
    while (this.runningJobs.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    logger.info('CronScheduler completely stopped.');
  }
}

module.exports = new CronScheduler();
