import config from "config";
import { promises as fs } from "fs";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";

const helpConfig = config.get("help");

class HelpCommand extends Command {
  async action({chatId}) {
    const help = await fs.readFile(helpConfig.path, "utf-8");
    await sendMessage(help, chatId, "Markdown");
  }
}

export {HelpCommand}