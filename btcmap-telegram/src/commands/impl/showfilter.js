import { dbmanager } from "btcmap-database";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";
import { html as format } from "telegram-format";

class ShowFilterCommand extends Command {
  async action({chatId}) {
    const chat = await dbmanager.getUserById(chatId);
    await sendMessage(`<pre><code>${format.escape(chat.filter)}</code></pre>`, chatId);
  } 
}

export { ShowFilterCommand }