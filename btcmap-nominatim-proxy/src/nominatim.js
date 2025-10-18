import got from "got";
import config from "config";
import { injectProxy } from "http-utils";
import _ from "lodash";
import { dispatchNominatimError } from "./error-dispatcher.js";
import { throttle } from "./throttle.js";

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
