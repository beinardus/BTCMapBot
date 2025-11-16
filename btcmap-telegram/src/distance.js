import { getDistance } from "geolib";
import { logger } from "btcmap-common";

const isValidCoordinate = (p) =>
  p.latitude != null && p.longitude != null;

const distanceFactory = (poiPoint) => {
  // the point to be tested
  if (!isValidCoordinate(poiPoint)) {
    logger.error("`distance` should be called with a latitude and longitude parameter");
    return false;
  }

  return (latitude, longitude) => {
    // the point defined in the filter
    const p2 = ({latitude, longitude});
    return getDistance(poiPoint, p2);
  }
};

export {distanceFactory}