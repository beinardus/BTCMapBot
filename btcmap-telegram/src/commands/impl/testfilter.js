import { html as format } from "telegram-format";
import { dbmanager } from "btcmap-database";
import { logger } from "btcmap-common";
import { getGeo, GeoapifyError } from "geoapify";
import { createJsonata } from "../../jsonata.js";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";
import { CommandArgsError, CommandError } from "../../error-dispatcher.js";
import { distanceFactory } from "../../distance.js";

class TestFilterCommand extends Command {
  async action({chatId, args}) {
    if (!args)
      throw new CommandArgsError(`/${this.token} requires a coordinate: lat,lon`);
  
    try {
      const [lat, lon] = args.split(",").map(Number);
                
      const {filter} = await dbmanager.getUserById(chatId);
      const filterFn = createJsonata(filter, [
        {name: "distance", fn: distanceFactory({latitude:lat, longitude:lon}), signature: "<nn:n>"}]
      );
  
      const geo = await getGeo(lat, lon);
  
      await sendMessage(`Geo data:  
  ${format.escape(JSON.stringify(geo))}
  Is ${await filterFn.evaluate(geo)?"inside":"outside"} the working area.`, chatId);
    }
    catch (err) {
      logger.error("Unable to fetch data", err);
      if (err instanceof GeoapifyError)
        throw new CommandError("Unable to fetch Geoapify data", err);
    }
  }
}

export { TestFilterCommand }