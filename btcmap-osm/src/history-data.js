import got from "got";
import config from "config";
import { XMLParser } from "fast-xml-parser";
import { injectProxy } from "http-utils";
import { dispatchOSMError } from "./error-dispatcher.js";
import { locationStatus } from "btcmap-common";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
const osmConfig = config.get("osm");

const constructRequestOptions = () => {
  return injectProxy({responseType: "text"}, config.get("proxy"));
}

/**
 * Parses an OSM history XML response into a normalised version list.
 *
 * @param {string} xml
 * @param {string} type  - OSM element type ("node" | "way" | "relation")
 * @returns {Array<{
 *   visible: string,
 *   changeset: string|null,
 *   user: string|null,
 *   version: string|null,
 *   tags: Record<string,string>
 * }>}
 */
function parseHistoryXML(xml, type) {
  const parsed = parser.parse(xml);
  const osm = parsed?.osm ?? {};

  // Elements can be a single object or an array
  const elements = osm[type] ? [].concat(osm[type]) : [];

  return elements.map((el) => {
    // Collect child <tag> elements into a plain object
    const tagList = el.tag ? [].concat(el.tag) : [];
    const tags = Object.fromEntries(tagList.map((t) => [t.k, t.v]));

    return {
      visible: el.visible !== undefined ? String(el.visible) : "true",
      changeset: el.changeset !== undefined ? String(el.changeset) : null,
      user: el.user ?? null,
      version: el.version !== undefined ? String(el.version) : null,
      tags,
    };
  });
}

/**
 * Fetches the full version history of a POI from the OSM API.
 *
 * @param {{ id: number, type: string }} poi
 * @returns {Promise<Array<{
 *   visible: string,
 *   changeset: string|null,
 *   user: string|null,
 *   version: string|null,
 *   tags: Record<string,string>
 * }>>}
 */
async function fetchHistory(poi) {
  try {
    const url = osmConfig["url-fmt"]
      .replace("[ID]", poi.id)
      .replace("[TYPE]", poi.type);
    
    const response = await got(url, constructRequestOptions());
    const xml = response.body  

    return parseHistoryXML(xml, poi.type);
  }
  catch(err) {
    dispatchOSMError(err);
  }
}

export async function enrichDataWithHistory(data) {

  const toChangeset = (v) =>
    v ? { id: v.changeset, user: v.user } : undefined;

  for  (const d of data) {
    const versions = await fetchHistory(d);

    if (!versions || versions.length === 0) {
      d.history = { [locationStatus.UPDATE]: undefined, [locationStatus.CREATE]: undefined, [locationStatus.DELETE]: undefined };
      continue;
    }

    // latest: last version in history
    const latestVersion = versions[versions.length - 1];

    // created: last version where currency:XBT === "yes"
    let createdVersion;
    for (let i = versions.length - 1; i >= 0; i--) 
      if (versions[i].tags?.["currency:XBT"] === "yes") {
        createdVersion = versions[i];
        break;
      }

    // deleted: last version where visible === "false"
    //          OR currency:XBT was present & "yes" in previous version
    //             but is now absent / "no"
    let deletedVersion;
    for (let i = versions.length - 1; i >= 0; i--) {
      const v = versions[i];
      const isOsmDeleted = v.visible === "false";
      const xbtNowGone
        = i > 0
        && versions[i - 1].tags?.["currency:XBT"] === "yes"
        && (v.tags?.["currency:XBT"] !== "yes");

      if (isOsmDeleted || xbtNowGone) {
        deletedVersion = v;
        break;
      }
    }

    d.history = {
      [locationStatus.UPDATE]: toChangeset(latestVersion),
      [locationStatus.CREATE]: toChangeset(createdVersion),
      [locationStatus.DELETE]: toChangeset(deletedVersion),
    };
  }
}
