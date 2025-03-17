import { CommandArgsError } from "../../error-dispatcher.js";
import { sendMessage } from "../../notify.js";
import { Command } from "../command.js";

class SendMessageCommand extends Command {
  async action({args}) {
    const reArgs = /(?<tgtChatId>[0-9-]+)\s((pm=)?(?<parseMode>html|markDown|markDown2)\s)?(?<message>.*$)/i;
    const match = args.match(reArgs);
    if (!match)
      throw new CommandArgsError("Invalid arguments, use: chatID [[pm=]parseMode] message");
  
    const {tgtChatId, parseMode, message} = match.groups;
    await sendMessage(message, tgtChatId, parseMode);
  }
}

export {SendMessageCommand}