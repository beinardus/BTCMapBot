import got from "got";
import config from "config";
import { injectProxy } from "http-utils";
import dotenv from "dotenv";
import { dispatchNominatimError } from "./error-dispatcher.js";

dotenv.config();
const nominatimConfig = config.get("nominatim");

const constructRequestOptions = () => {
  return injectProxy(
    {
      responseType: "json"
    },
    config.get("proxy"));
}

async function getGeo(latitude, longitude) {
  try {
    const url = nominatimConfig["url-fmt"]
      .replace("[LAT]", latitude)
      .replace("[LON]", longitude);      
        
    const response = await got(url, constructRequestOptions());
    return response.body;
  }
  catch(err) {
    dispatchNominatimError(err);
  }
}

export {getGeo};
