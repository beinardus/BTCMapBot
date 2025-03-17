import got from "got";
import config from "config";
import { injectProxy } from "http-utils";
import _ from "lodash";
import dotenv from "dotenv";
import { dispatchGeoapifyError } from "./error-dispatcher.js";

dotenv.config();
const geoapifyConfig = config.get("geoapify");

const constructRequestOptions = () => {
  return injectProxy({responseType: "json"}, config.get("proxy"));
}

async function getGeo(latitude, longitude) {
  try {
    const url = geoapifyConfig["url-fmt"]
      .replace("[LAT]", latitude)
      .replace("[LON]", longitude)
      .replace("[GEOAPIFY_API_KEY]", process.env.GEOAPIFY_API_KEY);      
        
    const response = await got(url, constructRequestOptions());
    const results = response.body.features;

    if (results.length > 0) 
      return _.pick(results[0].properties, ["country_code", "state", "district", "city"]);

    return null;
  }
  catch(err) {
    dispatchGeoapifyError(err);
  }
}

export {getGeo};