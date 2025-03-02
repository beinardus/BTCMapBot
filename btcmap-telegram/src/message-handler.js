import {promises as fs} from 'fs';
import { html as format } from 'telegram-format';
import config from 'config';
import { sendMessage } from './notify.js';
import { dbmanager } from 'btcmap-database';
import { logger } from "btcmap-common";
import { getUserRole, isAdminRole, isMasterRole } from './telegram-utils.js';
import { getGeo, GeoapifyError } from 'geoapify';
import { createJsonata } from './jsonata.js';

const helpConfig = config.get("help");

function getUserId(message) {
  // a channel does channel things
  const user = message.from || message.sender_chat;
  return user.id; 
}

async function listUsers() {
  const users = await dbmanager.getActiveUsers();
  return users.map(u => `${u.id} | ${format.escape(u.name??"")}`).join("\n");
}

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
    switch (cmd) {
      case 'start': {
        await sendMessage('Welcome to the bot! Use <code>/help</code> for instructions.', chatId);
        break;
      }

      case 'help': {
        const help = await fs.readFile(helpConfig.path, 'utf-8');
        await sendMessage(help, chatId, "Markdown");
        break;
      }

      case 'showfilter': {
        const chat = await dbmanager.getUserById(chatId);
        await sendMessage(`<pre><code>${chat.filter}</code></pre>`, chatId);
        break;
      }

      case 'setfilter': {
        if (!isAdminRole(await getUserRole(chatId, userId))) {
          await sendMessage("🚫 You don't have permission to use this command.", chatId);
          break;
        }

        if (!args) {
          await sendMessage(`/setfilter requires a filter expression`, chatId);
          break;
        }

        try {
          createJsonata(args);
        }
        catch (err) {
          logger.error(`Invalid filter: ${args}`, err);
          await sendMessage(`You did not enter a valid filter`, chatId);
          break;
        }

        await dbmanager.setFilter(chatId, args);
        await sendMessage("Filter updated succesfully", chatId);
        break;
      }

      case 'testfilter': {
        if (!args) {
          await sendMessage(`/testfilter requires a coordinate: lat,lon`, chatId);
          break;
        }

        try {
          const [lat, lon] = args.split(",").map(Number);
                    
          const {filter} = await dbmanager.getUserById(chatId);
          const filterFn = createJsonata(filter);

          const geo = await getGeo(lat, lon);

          await sendMessage(`Geo data:  
${format.escape(JSON.stringify(geo))}
Is ${await filterFn.evaluate(geo)?"inside":"outside"} the working area.`, chatId);
        }
        catch (err) {
          logger.error("Unable to fetch data", err);
          if (err instanceof GeoapifyError) 
            await sendMessage("Unable to fetch Geoapify data", chatId);
                    
        }
        break;
      }

      case "echo":
        await sendMessage(args, chatId);
        break;

      case "listusers":
        if (!isMasterRole(await getUserRole(chatId, userId))) {
          await sendMessage("🚫 You don't have permission to use this command.", chatId);
          break;
        }

        await sendMessage(await `<pre><code>${await listUsers()}</code></pre>`, chatId);
        break;

      case "sendmessage":
        if (!isMasterRole(await getUserRole(chatId, userId))) {
          await sendMessage("🚫 You don't have permission to use this command.", chatId);
          break;
        }

        await masterSendMessage(chatId, args);
        break;
    }
  }
}
  
export { handleTextMessage };