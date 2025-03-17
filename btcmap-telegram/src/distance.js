import { getDistance } from "geolib";
import { logger } from "btcmap-common";

const isValidCoordinate = (p) =>
  p.latitude != null && p.longitude != null;

const distanceFactory = (p1) => (latitude, longitude) => {
  // error between the chair and the monitor
  const p2 = ({latitude, longitude});
  if (!isValidCoordinate(p2)) {
    logger.error("`distance` should have been called with a latitude and longitude parameter");
    return false;
  }

  // cannot calculate a distance if the location has no coordinats
  if (!isValidCoordinate(p1)) return false;

  return getDistance(p1, p2);
};

export {distanceFactory}