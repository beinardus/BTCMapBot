import { getDistance } from "geolib";
import { JsonataError } from "./error-dispatcher.js";

const isValidCoordinate = (p) =>
  p.latitude != null && p.longitude != null;

const distanceFactory = (poiPoint) => {
  // the point to be tested
  if (!isValidCoordinate(poiPoint))
    throw new JsonataError("`distance` should be called with a latitude and longitude parameter");

  return (latitude, longitude) => {
    // the point defined in the filter
    const p2 = ({latitude, longitude});
    return getDistance(poiPoint, p2);
  }
};

export {distanceFactory}