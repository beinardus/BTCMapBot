import { isPointInPolygon } from "geolib";
import { logger } from "btcmap-common";

const isValidCoordinate = (p) =>
  p.latitude != null && p.longitude != null;

const isValidPolygon = (polygon) =>
  Array.isArray(polygon) && polygon.length >= 3 && polygon.every(isValidCoordinate);

const inPolygonFactory = (poiPoint) => { 
  // the point to be tested
  if (!isValidCoordinate(poiPoint)) {
    logger.error("`inpolygon` should be called with a latitude and longitude parameter");
    return false;
  }

  // the function called per user (that makes use of the $inpolygon function)
  return (polygon) => {
    if (!Array.isArray(polygon)) {
      logger.error("`inpolygon` should have been called with an array parameter");
      return false;
    }

    // In GeoJSON, polygons are defined as an array of [longitude, latitude] pairs
    const polygonCoordinates = polygon.map(([longitude,latitude]) => ({latitude, longitude})); 

    if (!isValidPolygon(polygonCoordinates)) {
      logger.error("`inpolygon` parameter contains invalid coordinates");
      return false;
    }

    return isPointInPolygon(poiPoint, polygonCoordinates);
  }
};

export {inPolygonFactory}