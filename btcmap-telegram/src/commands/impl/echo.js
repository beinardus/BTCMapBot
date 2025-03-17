import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";

class EchoCommand extends Command {
  async action({chatId, args}) {
    await sendMessage(args, chatId);
  }
}

export {EchoCommand}