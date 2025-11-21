import { getDistance } from "geolib";
import { getGeo } from "nominatim";
import { logger, geoSource } from "btcmap-common";

const needGeoUpdate = (d) => {
  // revalidate if there was no previous recording
  if (d.geo_source == geoSource.NONE)
    return true;

  const p1 = { latitude: d.transition.prevLat, longitude: d.transition.prevLon };
  const p2 = { latitude: d.lat, longitude: d.lon };

  // revalidate if the distance exceeds 1m
  return getDistance(p1,p2) > 1.0;
}

const updateGeo = async (d) => {
  if (needGeoUpdate(d)) {
    logger.debug(`updating geodata for location ${d.id}`);
    const geo = await getGeo(d.lat, d.lon);
    Object.assign(
      d,
      Object.fromEntries(
        Object.entries(geo).map(([key, value]) => [`geo_${key}`, value])
      )
    );
    d.geo_source = geoSource.NOMINATIM;
  }
}

const geoFromLocation = (d) => {
  return Object.fromEntries(
    Object.entries(d)
      .filter(([key]) => key.startsWith("geo_"))
      .map(([key, value]) => [key.replace("geo_", ""), value])
  );
}

export { updateGeo, geoFromLocation }