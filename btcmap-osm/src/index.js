import schedule from "node-schedule";
import config from "config";
import { logger, locationStatus } from "btcmap-common";
import { dbmanager } from "btcmap-database";
import * as btcmap from "./btcmap.js";
import * as reporter from "./zmq-reporter.js"; // or use plain reporter.js for debugging
//import * as reporter from "./reporter.js";
import { createStats } from "./stats.js";
import { enrichDataWithTransition, enrichDataWithReportType } from "./data-interpreter.js";
import { CustomError } from "custom-error";

const JOB_NAME = "synchronize";

async function synchronize() {
  // retrieve the latest stamp from the database
  const latestStats = await dbmanager.getStats();

  // run-up the configured time if no previous run exists
  const latestUpdate = new Date(
    latestStats
      ? latestStats.latest_stamp
      : (Date.now() - config.get("initialRunupPeriod")));

  let data = await btcmap.retrieveData(latestUpdate);

  enrichDataWithTransition(data, latestUpdate);
  await dbmanager.enrichDataWithActivationStatus(data);
  enrichDataWithReportType(data);

  await dbmanager.batchUpdateLocations(data);

  for (const d of data) {
    // only report essential events
    const reportType = d.transition.reportType;
    switch(reportType) {
      case locationStatus.CREATE:
      case locationStatus.DELETE:
        await reporter.report(reportType, d);
    }
  }

  const stats = createStats(data);
  logger.debug(
    `created: ${stats[locationStatus.CREATE][0]} ➡ ${stats[locationStatus.CREATE][1]}, `
  + `deleted: ${stats[locationStatus.DELETE][0]} ➡ ${stats[locationStatus.DELETE][1]}, `
  + `updated: ${stats[locationStatus.UPDATE][0]} ➡ ${stats[locationStatus.UPDATE][1]}`);
}

async function executeJob(jobName) {
  try {
    logger.debug(`${jobName} started`);
    await synchronize();
    logger.debug(`${jobName} finished`);
    logger.debug(`next invocation: ${schedule.scheduledJobs[jobName]?.nextInvocation() || "not set"}`);
  } 
  catch(err) {
    if (err instanceof CustomError)
      throw err;

    logger.error("unknown error", err);
    throw err;
  }
}

async function main() {
  logger.info("BTCMap synchronizer v1.2 started");
  await reporter.setup();

  const scheduledJob = schedule.scheduleJob(JOB_NAME, config.get("cron"), async () => await executeJob(JOB_NAME));
  scheduledJob.on("error", (err) => {
    logger.debug("gracefulShutdown on job error");
    schedule.gracefulShutdown().then(() => {
      // do not throw before the job is finished!
      // https://github.com/node-schedule/node-schedule/issues/743      
      throw err;
    });
  });

  logger.info(`next invocation: ${scheduledJob.nextInvocation()}`);
}

process.on("SIGINT", function () { 
  logger.debug("gracefulShutdown on termination");
  schedule.gracefulShutdown()
    .then(() => {
      logger.debug("exiting with code 0");
      process.exit(0);
    });
});

process.on("uncaughtException", (err) => {
  logger.error(err.stack??err);
  logger.debug("exiting with code 1");
  process.exit(1);
});

main();