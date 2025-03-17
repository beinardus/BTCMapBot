import zmq from "zeromq";
import {logger, locationStatus} from "btcmap-common";
import { getGeo } from "geoapify";
import config from "config";

const zmqConfig = config.get("zmq");

const publisher = new zmq.Publisher();

const report = async (status, l) => {
  const geo = (l.lat != null && l.lon != null) ? await getGeo(l.lat, l.lon) : null;

  switch (status) {
    case locationStatus.CREATE:
    case locationStatus.DELETE: {
      // same message structure for both create and delete
      const message = JSON.stringify({
        id: l.id,
        status: status,
        name: l.name,
        city: l.city,
        geo: geo,
        lat: l.lat,
        lon: l.lon,
        type: l.type
      });

      logger.debug(`${status}: ${l.id} and more published on zmq`);
      publisher.send(message);
      break;
    }
    
    default:
      logger.warn(`No report handler for status: ${status}`);
  }
}

const setup = async() => {
  await publisher.bind(zmqConfig.url);
  logger.info(`Zmq publisher bound to ${zmqConfig.url}`);
}

export {report, setup}