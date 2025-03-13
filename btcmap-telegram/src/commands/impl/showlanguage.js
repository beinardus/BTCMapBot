import { dbmanager } from "btcmap-database";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";

class ShowLanguageCommand extends Command {
  async action({chatId}) {
    const chat = await dbmanager.getUserById(chatId);
    await sendMessage(`<pre><code>${chat.language??"(not set)"}</code></pre>`, chatId);
  }
}

export { ShowLanguageCommand }