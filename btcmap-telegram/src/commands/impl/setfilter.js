import { dbmanager } from "btcmap-database";
import { logger } from "btcmap-common";
import { createJsonata, JsonataError } from "btcmap-jsonata";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";
import { CommandError, CommandArgsError } from "../../error-dispatcher.js";

class SetFilterCommand extends Command {
  async action({chatId, args}) {
    if (!args)
      throw new CommandArgsError(`/${this.token} requires a filter expression`);
  
    try {
      // just to validate the expression      
      createJsonata(args);
    }
    catch (err) {
      logger.error(`Invalid filter: ${args}`, {err});
      if (err instanceof JsonataError)
        throw new CommandError(`You did not enter a valid filter:\n${err.message}`);

      throw new CommandError("Unexpected error when changing the filter. Please report.");
    }
  
    await dbmanager.setFilter(chatId, args);
    await sendMessage("Filter updated succesfully", chatId);
  }
}

export {SetFilterCommand}