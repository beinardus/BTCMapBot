import { sendNotification } from "./notify.js";
import { constructMessage } from "./construct-message.js";
import { constructImageUrl } from "./construct-image-url.js";
import { filterRecipients } from "./recipients-filter.js";
import { TelegramError } from "./error-dispatcher.js";
import * as telegramErrorCodes from "./telegram-error-codes.js";
import { dbmanager } from "btcmap-database";
import { logger } from "btcmap-common";

const handleBtcMapUpdate = async (data) => {
  const recipients = await filterRecipients(data.geo);
  await notifyRecipients(recipients, data);
};

const notifyRecipients = async (recipients, data) => {
  for (const r of recipients) 
    try {
      const imageUrl = constructImageUrl({...data, user: r});
      const message = constructMessage({...data, user: r});

      await sendNotification(imageUrl, message, r.id);
    } 
    catch (err) {
      await handleNotificationError(err, r.id);
    }
};

const handleNotificationError = async (err, recipientId) => {
  logger.error(err);

  if (err instanceof TelegramError) 
    switch (err.errorCode) {
      case telegramErrorCodes.INVALID_CHAT:
        await dbmanager.deactivateUser(recipientId);
        break;
    }
};

export { handleBtcMapUpdate }