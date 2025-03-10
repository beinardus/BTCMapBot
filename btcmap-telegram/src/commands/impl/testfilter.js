import { html as format } from 'telegram-format';
import { dbmanager } from 'btcmap-database';
import { logger } from "btcmap-common";
import { getGeo, GeoapifyError } from 'geoapify';
import { createJsonata } from '../../jsonata.js';
import { sendMessage } from '../../notify.js';
import { Command } from '../command.js';

class TestFilterCommand extends Command {
  async action({chatId, args}) {
    if (!args) {
      await sendMessage(`/${this.token} requires a coordinate: lat,lon`, chatId);
      return;
    }
  
    try {
      const [lat, lon] = args.split(",").map(Number);
                
      const {filter} = await dbmanager.getUserById(chatId);
      const filterFn = createJsonata(filter);
  
      const geo = await getGeo(lat, lon);
  
      await sendMessage(`Geo data:  
  ${format.escape(JSON.stringify(geo))}
  Is ${await filterFn.evaluate(geo)?"inside":"outside"} the working area.`, chatId);
    }
    catch (err) {
      logger.error("Unable to fetch data", err);
      if (err instanceof GeoapifyError) 
        await sendMessage("Unable to fetch Geoapify data", chatId);
    }
  }
}

export { TestFilterCommand }