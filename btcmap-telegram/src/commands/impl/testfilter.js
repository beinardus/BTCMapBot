import { html as format } from "telegram-format";
import { dbmanager } from "btcmap-database";
import { logger } from "btcmap-common";
import { getGeo, NominatimError } from "nominatim";
import { createJsonata } from "btcmap-jsonata";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";
import { CommandArgsError, CommandError } from "../../error-dispatcher.js";

class TestFilterCommand extends Command {
  async action({chatId, args}) {
    if (!args)
      throw new CommandArgsError(`/${this.token} requires a coordinate: lat,lon`);
  
    try {
      const [lat, lon] = args.split(",").map(Number);
                
      const {filter} = await dbmanager.getUserById(chatId);
      const filterFn = createJsonata(filter, {lat, lon});
  
      const geo = await getGeo(lat, lon);
  
      await sendMessage(`Geo data:  
  ${format.escape(JSON.stringify(geo))}
  This does ${await filterFn.evaluate(geo)?"":"not "}match the set filter.`, chatId);
    }
    catch (err) {
      logger.error("Unable to fetch data", err);
      if (err instanceof NominatimError)
        throw new CommandError("Unable to fetch Nominatim data", err);
    }
  }
}

export { TestFilterCommand }