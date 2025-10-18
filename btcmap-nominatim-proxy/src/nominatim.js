import got from "got";
import config from "config";
import { injectProxy } from "http-utils";
import _ from "lodash";
import { dispatchNominatimError } from "./error-dispatcher.js";

const nominatimConfig = config.get("nominatim");

const constructRequestOptions = () => {
  return injectProxy(
    {
      responseType: "json",
      headers: {
        "User-Agent": nominatimConfig["user-agent"]
      }
    },
    config.get("proxy")
  );
};

let lastCall = 0;
async function throttle(fn, delay) {
  const now = Date.now();
  const waitTime = Math.max(0, delay - (now - lastCall));
  if (waitTime > 0) await new Promise(res => setTimeout(res, waitTime));

  const result = await fn();
  lastCall = Date.now();
  return result;
}

export async function getGeo(latitude, longitude) {
  try {
    const url = nominatimConfig["url-fmt"]
      .replace("[LAT]", latitude)
      .replace("[LON]", longitude);

    const response = await throttle(
      async () => await got(url, constructRequestOptions()),
      nominatimConfig.throttle
    );

    const result = response.body.address;
    if (result) 
      return _.pick(result, [
        "country_code",
        "country",
        "state",
        "county",
        "municipality",
        "city",
        "town",
        "village"
      ]);

    return null;
  } 
  catch (err) {
    dispatchNominatimError(err);
  }
}
