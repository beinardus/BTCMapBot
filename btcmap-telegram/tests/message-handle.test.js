import { commands } from "../src/commands.js";
import { CommandAuthError } from "../src/error-dispatcher.js";
import { handleTextMessage } from "../src/message-handler.js";
import * as roles from "../src/telegram-user-roles.js";
import { getUserRole } from "../src/telegram-utils.js";

// avoid any reporting to Telegram
jest.mock("../src/notify.js");

// avoid access to geoapify
jest.mock("../../geoapify/index.js");

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

describe("Test if the action is called if the user is authorized", () => {
  test.each(testCases)("$cmd", async ({cmd, any, admin, master}) => {

    const actionMock = jest
      .spyOn(commands[cmd], "action")
      .mockResolvedValue(undefined);

    const rolesToCheck = [
      {role: roles.MEMBER, expected: any},
      {role: roles.ADMINISTRATOR, expected: admin},
      {role: roles.MASTER, expected: master}
    ];

    for(const role of rolesToCheck.filter(r => r.expected)) {
      getUserRole.mockResolvedValue(role.role);

      await handleTextMessage({
        chat: {id: 123},
        from: {id: 123},
        text: `/${cmd} args`});
    
      expect(actionMock).toHaveBeenCalledTimes(1);
      actionMock.mockClear();
    }
  });
});


describe("Test if the CommandAuth error is thrown is the user is not authorized", () => {
  test.each(testCases)("$cmd", async ({cmd, any, admin, master}) => {
    const rolesToCheck = [
      {role: roles.MEMBER, expected: any},
      {role: roles.ADMINISTRATOR, expected: admin},
      {role: roles.MASTER, expected: master}
    ];

    for(const role of rolesToCheck.filter(r => !r.expected)) {
      getUserRole.mockResolvedValue(role.role);

      await expect(handleTextMessage({
        chat: {id: 123},
        from: {id: 123},
        text: `/${cmd} args`})).rejects.toThrow(CommandAuthError);
    }
  });
});