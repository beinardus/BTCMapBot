import got from "got";
import config from "config";
import { logger } from "btcmap-common";
import { injectProxy } from "http-utils";
import { latLonFromOSM } from "./osm-utils.js";
import { dispatchBTCMapError } from "./error-dispatcher.js";

const btcmapConfig = config.get("btcmap");

const constructRequestOptions = () => {
  return injectProxy({responseType: "json"}, config.get("proxy"));
}

const retrieveData = async (date) => {
  try {
    // Convert to ISO string in Zulu time format
    const zuluTime = date.toISOString();

    const url = btcmapConfig["url-fmt"].replace("[ZULU]", zuluTime);
    const response = await got.get(url, constructRequestOptions());

    const data = response.body.map(n => ({
      type: n.osm_json.type,
      ...latLonFromOSM(n.osm_json),
      id: n.osm_json.id,
      city: n.osm_json.tags?.["addr:city"],
      name: n.osm_json.tags?.["name"],
      created_at: n.created_at,
      updated_at: n.updated_at,
      deleted_at: n.deleted_at
    }));

    logger.debug(`fetched ${data.length} locations from the btcmap API`);
    return data;
  }
  catch (error) {
    dispatchBTCMapError(error);
  }
}

export {retrieveData};