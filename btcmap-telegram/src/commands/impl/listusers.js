import { html as format } from "telegram-format";
import { sendMessage } from "../../notify.js";
import { dbmanager } from "btcmap-database";
import { Command } from "../command.js";

async function listUsers() {
  const users = await dbmanager.getActiveUsers();
  return users.map(u => `${u.id} | ${format.escape(u.name??"")}`).join("\n");
}

class ListUsersCommand extends Command {
  async action({chatId}) {
    await sendMessage(`<pre><code>${await listUsers()}</code></pre>`, chatId);
  }
}

export {ListUsersCommand}