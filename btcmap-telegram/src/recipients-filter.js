import { dbmanager } from "btcmap-database";
import { logger } from "btcmap-common";
import { createJsonata } from "./jsonata.js";
import { distanceFactory } from "./distance.js";
import { inPolygonFactory } from "./polygon.js";

async function filterRecipients(geo) {
  const users = await dbmanager.getActiveUsers();

  const filteredUsers = await Promise.all(
    users.map(async (u) => {
      const filterFn = createJsonata(u.filter, [
        {name: "distance", fn: distanceFactory({latitude:geo.lat, longitude:geo.lon}), signature: "<nn:n>"},
        {name: "inpolygon", fn: inPolygonFactory({latitude:geo.lat, longitude:geo.lon}), signature: "<a:b>"} // todo: a<nn>
      ]);

      let passes = false;
      try {
        passes = await filterFn.evaluate(geo);
      }
      catch {
        // Log error, but proceed to the next user
        logger.error(`Filter evaluation failed: ${u.filter}`);
      }

      // Return the user and whether they pass the filter
      return { user: u, passes };
    })
  );

  // Filter the users based on the `passes` value
  return filteredUsers.filter(result => result.passes).map(result => result.user);    
}

export { filterRecipients }