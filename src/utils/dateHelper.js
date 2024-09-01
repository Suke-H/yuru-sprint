const schedule = require('node-schedule');

class Scheduler {
  constructor(testMode = false) {
    this.testMode = testMode;
    this.scheduledJobs = [];
  }

  scheduleJob(cronExpression, job) {
    if (this.testMode) {
      this.scheduledJobs.push({ cronExpression, job });
      return { nextInvocation: () => new Date() };
    } else {
      return schedule.scheduleJob(cronExpression, job);
    }
  }

  runScheduledJobs() {
    if (this.testMode) {
      this.scheduledJobs.forEach(job => job.job());
    }
  }
}

module.exports = {
  Scheduler
};
