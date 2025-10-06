import { locationStatus } from "btcmap-common";
import { getGeo } from "geoapify";

const report = async (status, l) => {
  const geo = (l.lat != null && l.lon != null) ? await getGeo(l.lat, l.lon) : null;

  switch (status) {
    case locationStatus.CREATE:
      console.log(`A new location found: ${l.name}
city: ${l.city}
country: ${geo.country_code}
osm type: ${l.type},
osm id: ${l.id}`);
      break;

    case locationStatus.DELETE:
      console.log(`A location is deleted: ${l.name}
city: ${l.city}
country: ${geo.country_code}
osm type: ${l.type},
osm id: ${l.id}`);
      break;

    default:
      console.log(`No report handler for status: ${status}`);
  }
}

const setup = async () => {
  // Nothing to do
}

export {report, setup};