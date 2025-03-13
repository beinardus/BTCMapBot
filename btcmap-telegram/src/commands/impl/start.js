import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";

class StartCommand extends Command {
  async action({chatId}) {
    await sendMessage("Welcome to the bot! Use <code>/help</code> for instructions.", chatId);
  }
}

export {StartCommand}