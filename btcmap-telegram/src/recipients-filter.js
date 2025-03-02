import { dbmanager } from "btcmap-database";
import { createJsonata } from "./jsonata.js";

async function filterRecipients(geo) {
  const users = await dbmanager.getActiveUsers();

  const filteredUsers = await Promise.all(
    users.map(async (u) => {
      const filterFn = createJsonata(u.filter);

      // Return the user and whether they pass the filter
      return { user: u, passes: await filterFn.evaluate(geo) };
    })
  );

  // Filter the users based on the `passes` value
  return filteredUsers.filter(result => result.passes).map(result => result.user);    
}

export { filterRecipients }