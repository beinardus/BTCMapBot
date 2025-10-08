import { locationStatus } from "btcmap-common";
import { getGeo } from "nominatim";

const report = async (status, l) => {
  const geo = (l.lat != null && l.lon != null) ? await getGeo(l.lat, l.lon) : null;

  switch (status) {
    case locationStatus.CREATE:
      console.log(`A new location found: ${l.name}
city: ${l.city}
city (geo): ${geo.city}
country: ${geo.country_code}
state: ${geo.state}
municipality: ${geo.municipality}
town: ${geo.town}
village: ${geo.village}
osm type: ${l.type},
osm id: ${l.id}`);
      break;

    case locationStatus.DELETE:
      console.log(`A location is deleted: ${l.name}
city: ${l.city}
city (geo): ${geo.city}
country: ${geo.country_code}
state: ${geo.state}
municipality: ${geo.municipality}
town: ${geo.town}
village: ${geo.village}
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