import { dbmanager } from "btcmap-database";
import { languages } from "translation";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";
import { CommandArgsError } from "../../error-dispatcher.js";

class SetLanguageCommand extends Command {
  async action({chatId, args}) {
    if (!args) 
      throw new CommandArgsError(`/${this.token} requires a language code.`);
  
    const lanOptions = Object.values(languages);
    if (lanOptions.every(l => l !== args)) 
      throw new CommandArgsError(`Language '${args}' not supported yet. Supported languages are: ${lanOptions.join(",")}`);
  
    await dbmanager.setLanguage(chatId, args);
    await sendMessage("Language updated succesfully", chatId);
  }
}

export {SetLanguageCommand}