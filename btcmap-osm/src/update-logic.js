import {logger, activationStatus, locationStatus} from "btcmap-common";

const getReportType = (assignedStatus, prevStatus, newLocation) => {
  switch (assignedStatus) {
    case locationStatus.CREATE:
      // If it is already in the database, it was created before
      // In btcmap, create is a once in a lifetime event
      // Protect against replay
      return (prevStatus == activationStatus.UNKNOWN)
        ? locationStatus.CREATE
        : locationStatus.UPDATE

    case locationStatus.DELETE:
      // It is only a delete if it was not deleted during the last update
      // Protect against replay
      return (prevStatus == activationStatus.INACTIVE)
        ? locationStatus.UPDATE
        : locationStatus.DELETE

    case locationStatus.UPDATE:
      // In this situation, it could be a revival of a deleted location
      // Note: deleted locations can get updates apart from being activated again!
      return (prevStatus == activationStatus.INACTIVE && !newLocation.deleted_at)
        ? locationStatus.CREATE
        : locationStatus.UPDATE

    default:
      // should not come here at all
      logger.error(`Unknown locationStatus (${assignedStatus}). Assume it is an update.`);
      return locationStatus.UPDATE
  }
}

export { getReportType }