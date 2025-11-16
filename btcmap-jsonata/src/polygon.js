import { isPointInPolygon } from "geolib";
import { JsonataError } from "./error-dispatcher";

const isValidCoordinate = (p) =>
  p.latitude != null && p.longitude != null;

const isValidPolygon = (polygon) =>
  Array.isArray(polygon) && polygon.length >= 3 && polygon.every(isValidCoordinate);

const inPolygonFactory = (poiPoint) => { 
  // the point to be tested
  if (!isValidCoordinate(poiPoint))
    throw new JsonataError("`inpolygon` should be called with a latitude and longitude parameter");

  // the function called per user (that makes use of the $inpolygon function)
  return (polygon) => {
    if (!Array.isArray(polygon))
      throw new JsonataError("`inpolygon` should have been called with an array parameter");

    // In GeoJSON, polygons are defined as an array of [longitude, latitude] pairs
    const polygonCoordinates = polygon.map(([longitude,latitude]) => ({latitude, longitude})); 

    if (!isValidPolygon(polygonCoordinates))
      throw new JsonataError("`inpolygon` parameter contains invalid coordinates");

    return isPointInPolygon(poiPoint, polygonCoordinates);
  }
};

export {inPolygonFactory}