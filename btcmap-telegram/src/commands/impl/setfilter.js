import { dbmanager } from "btcmap-database";
import { logger } from "btcmap-common";
import { createJsonata } from "../../jsonata.js";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";
import { CommandError, CommandArgsError } from "../../error-dispatcher.js";

class SetFilterCommand extends Command {
  async action({chatId, args}) {
    if (!args)
      throw new CommandArgsError(`/${this.token} requires a filter expression`);
  
    try {
      createJsonata(args, [
        {name: "distance", fn: () => 0, signature: "<nn:n>"}]);
    }
    catch (err) {
      logger.error(`Invalid filter: ${args}`, {err});
      throw new CommandError("You did not enter a valid filter");
    }
  
    await dbmanager.setFilter(chatId, args);
    await sendMessage("Filter updated succesfully", chatId);
  }
}

export {SetFilterCommand}