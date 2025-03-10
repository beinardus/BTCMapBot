import { dbmanager } from 'btcmap-database';
import { logger } from "btcmap-common";
import { createJsonata } from '../../jsonata.js';
import { sendMessage } from '../../notify.js';
import { Command } from '../command.js';

class SetFilterCommand extends Command {
  async action({chatId, args}) {
    if (!args) {
      await sendMessage(`/${this.token} requires a filter expression`, chatId);
      return;
    }
  
    try {
      createJsonata(args);
    }
    catch (err) {
      logger.error(`Invalid filter: ${args}`, err);
      await sendMessage(`You did not enter a valid filter`, chatId);
      return;
    }
  
    await dbmanager.setFilter(chatId, args);
    await sendMessage("Filter updated succesfully", chatId);
  }
}

export {SetFilterCommand}