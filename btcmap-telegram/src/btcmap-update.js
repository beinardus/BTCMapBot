import { sendNotification } from "./notify.js";
import { constructNotificationText } from "./construct-notification-text.js";
import { constructNotificationImageUrl } from "./construct-notification-image-url.js";
import { filterRecipients } from "./recipients-filter.js";
import { TelegramError } from "./error-dispatcher.js";
import * as telegramErrorCodes from "./telegram-error-codes.js";
import { dbmanager } from "btcmap-database";
import { logger } from "btcmap-common";

const handleBtcMapUpdate = async (data) => {
  const recipients = await filterRecipients({...data.geo, lat:data.lat, lon:data.lon});
  await notifyRecipients(recipients, data);
};

const notifyRecipients = async (recipients, data) => {
  for (const r of recipients) 
    try {
      const imageUrl = constructNotificationImageUrl({...data, user: r});
      const message = constructNotificationText({...data, user: r});

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