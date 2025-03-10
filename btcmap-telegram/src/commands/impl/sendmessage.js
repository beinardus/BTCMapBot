import { sendMessage } from '../../notify.js';
import { Command } from '../command.js';

async function masterSendMessage(chatId, args) {
  const reArgs = /(?<tgtChatId>[0-9-]+)\s((pm=)?(?<parseMode>html|markDown|markDown2)\s)?(?<message>.*$)/i;
  const match = args.match(reArgs);
  if (!match) {
    await sendMessage("Invalid arguments, use: chatID [[pm=]parseMode] message", chatId);
    return;
  }

  const {tgtChatId, parseMode, message} = match.groups;
  await sendMessage(message, tgtChatId, parseMode);
}

class SendMessageCommand extends Command {
  async action({chatId, args}) {
    await masterSendMessage(chatId, args);
  }
}

export {SendMessageCommand}