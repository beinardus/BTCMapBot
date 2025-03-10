import { sendMessage } from './notify.js';
import { logger } from "btcmap-common";
import { commands } from "./commands.js";

function getUserId(message) {
  // a channel does channel things
  const user = message.from || message.sender_chat;
  return user.id; 
}

// Handle text messages
async function handleTextMessage(message) {
  const chatId = message.chat.id;
  const userId = getUserId(message);
  const text = message.text;
  
  logger.debug(`Received text message: ${text}`);

  const reMessage = /\/(?<cmd>[^\s]*)(\s(?<args>.*$))?/i;
  const match = text.match(reMessage);
  if (match) {
    const {cmd, args = ""} = match.groups;

    const command = commands[cmd];
    if (command) {
      if (!await command.auth(chatId, userId)) {
        await sendMessage("🚫 You don't have permission to use this command.", chatId);
        return;        
      }

      await command.action({chatId, args});
    }
  }
}
  
export { handleTextMessage };