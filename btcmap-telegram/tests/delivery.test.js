import { handleBtcMapUpdate } from "../src/btcmap-update.js";
import { TelegramError } from "../src/error-dispatcher";
import { sendNotification } from "../src/notify.js";
import { INVALID_CHAT } from "../src/telegram-error-codes";
import { filterRecipients } from "../src/recipients-filter.js";
import { dbmanager } from "btcmap-database";

jest.mock("btcmap-database", () => ({
  dbmanager: {
    deactivateUser: jest.fn(),
  },
}));

jest.mock("../src/notify.js", () => ({
  sendNotification: jest.fn(),
}));

jest.mock("../src/recipients-filter.js", () => ({
  filterRecipients: jest.fn()  
}));

test("should call deactivateUser when INVALID_CHAT error occurs", async () => {
  const data = { geo: "some-location" };
  const recipients = [{ id: 21 }];

  // Mock sendNotification to throw a TelegramError with INVALID_CHAT
  sendNotification.mockRejectedValueOnce(
    new TelegramError("mock error", null, INVALID_CHAT)
  );

  // Mock filterRecipients to return a recipient list
  filterRecipients.mockResolvedValue(recipients);

  await handleBtcMapUpdate(data);

  expect(dbmanager.deactivateUser).toHaveBeenCalledWith(21);
});
