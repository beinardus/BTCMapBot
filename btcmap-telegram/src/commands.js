import { EchoCommand } from "./commands/impl/echo.js";
import { HelpCommand } from "./commands/impl/help.js";
import { ListUsersCommand } from "./commands/impl/listusers.js";
import { SendMessageCommand } from "./commands/impl/sendmessage.js";
import { SetFilterCommand } from "./commands/impl/setfilter.js";
import { SetLanguageCommand } from "./commands/impl/setlanguage.js";
import { ShowFilterCommand } from "./commands/impl/showfilter.js";
import { ShowLanguageCommand } from "./commands/impl/showlanguage.js";
import { StartCommand } from "./commands/impl/start.js";
import { TestFilterCommand } from "./commands/impl/testfilter.js";
import { getUserRole, isAdminRole, isMasterRole } from "./telegram-utils.js"

const inAnyRole = async () => Promise.resolve(true);
const inAdminRole = async (chatId, userId) => isAdminRole(await getUserRole(chatId, userId));
const inMasterRole = async (chatId, userId) => isMasterRole(await getUserRole(chatId, userId));

const commands = [ 
  new StartCommand("start", inAnyRole),
  new HelpCommand("help", inAnyRole),
  new ShowFilterCommand("showfilter", inAnyRole),
  new SetFilterCommand("setfilter", inAdminRole),
  new TestFilterCommand("testfilter",inAnyRole),
  new ShowLanguageCommand("showlanguage", inAnyRole),
  new SetLanguageCommand("setlanguage", inAdminRole),
  new EchoCommand("echo", inAnyRole),
  new ListUsersCommand("listusers", inMasterRole),
  new SendMessageCommand("sendmessage", inMasterRole)]
  .reduce((a,c) => {
    a[c.token] = c;
    return a; 
  }, {});

export {commands}