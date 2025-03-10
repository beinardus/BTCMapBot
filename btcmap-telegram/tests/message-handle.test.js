import { commands } from "../src/commands.js";
import { handleTextMessage } from "../src/message-handler.js";
import * as roles from "../src/telegram-user-roles.js";
import { getUserRole } from "../src/telegram-utils.js";

// avoid reporting to Telegram
jest.mock('../src/notify.js');
import { sendMessage as sendMessageMock } from "../src/notify.js";

// manipulate the user role
jest.mock("../src/telegram-utils.js", () => ({
  ...jest.requireActual("../src/telegram-utils.js"), 
  getUserRole: jest.fn()
}));

const testCases = [
  {cmd: "start", any: true, admin: true, master: true},
  {cmd: "help", any: true, admin: true, master: true},
  {cmd: "showfilter", any: true, admin: true, master: true},
  {cmd: "setfilter", any: false, admin: true, master: true},
  {cmd: "testfilter", any: true, admin: true, master: true},
  {cmd: "showlanguage", any: true, admin: true, master: true},
  {cmd: "setlanguage", any: false, admin: true, master: true},
  {cmd: "echo", any: true, admin: true, master: true},
  {cmd: "listusers", any: false, admin: false, master: true},
  {cmd: "sendmessage", any: false, admin: false, master: true}
]

test.each(testCases)("$cmd", async ({cmd, any, admin, master}) => {

  const actionMock = jest
    .spyOn(commands[cmd], 'action')
    .mockResolvedValue(undefined);

  const rolesToCheck = [
    {role: roles.MEMBER, expected: any},
    {role: roles.ADMINISTRATOR, expected: admin},
    {role: roles.MASTER, expected: master}
  ];

  for(const role of rolesToCheck) {
    getUserRole.mockResolvedValue(role.role);

    await handleTextMessage({
      chat: {id: 123},
      from: {id: 123},
      text: `/${cmd} args`});
  
    expect(actionMock).toHaveBeenCalledTimes(role.expected?1:0);
    expect(sendMessageMock).toHaveBeenCalledTimes(role.expected?0:1);
    actionMock.mockClear();
    sendMessageMock.mockClear();
  }
});
