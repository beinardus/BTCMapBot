import { dbmanager } from 'btcmap-database';
import { languages } from "translation";
import { sendMessage } from '../../notify.js';
import { Command } from '../command.js';

class SetLanguageCommand extends Command {
  async action({chatId, args}) {
    if (!args) {
      await sendMessage(`/${this.token} requires a language code.`, chatId);
      return;
    }
  
    if (languages.all(l => l !== args)) {
      const lanOptions = Object.values(languages).join(",");
      await sendMessage(`Language '${args}' not supported yet. Supported languages are: ${lanOptions}`);
      return;
    }
  
    await dbmanager.setLanguage(chatId, args);
    await sendMessage("Language updated succesfully", chatId);
  }
}

export {SetLanguageCommand}