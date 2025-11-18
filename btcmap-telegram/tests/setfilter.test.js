import { CommandError } from "../src/error-dispatcher.js";
import { handleTextMessage } from "../src/message-handler.js";
import * as roles from "../src/telegram-user-roles.js";
import { getUserRole } from "../src/telegram-utils.js";

// avoid any reporting to Telegram
jest.mock("../src/notify.js");

// avoid access to nominatim
jest.mock("../../nominatim/index.js");

// manipulate the user role
jest.mock("../src/telegram-utils.js", () => ({
  ...jest.requireActual("../src/telegram-utils.js"), 
  getUserRole: jest.fn()
}));

const templateMessage 
  = {
    from: {
      id: 1
    },
    chat: {
      id: 1
    }
  };

const testCases = [
  {
    command: "/setfilter $distance()",
    response: "You did not enter a valid filter:\nFunction \"$distance\" expects 2 arguments."
  }];

describe("Test setfilter command with invalid filters", () => {
  getUserRole.mockResolvedValue(roles.ADMINISTRATOR);

  test.each(testCases)("$command", async ({command, response}) => {
    await expect(handleTextMessage({...templateMessage, text: command})).rejects.toThrow(new CommandError(response));
  })
});
