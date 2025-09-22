import { sendNotification, sendMessage } from "./notify.js";
import { constructNotificationText } from "./construct-notification-text.js";
import { constructNotificationImageUrl } from "./construct-notification-image-url.js";
import { filterRecipients } from "./recipients-filter.js";
import { TelegramError } from "./error-dispatcher.js";
import * as telegramErrorCodes from "./telegram-error-codes.js";
import { FloodDetector } from "./flood-detector.js";
import { dbmanager } from "btcmap-database";
import { logger } from "btcmap-common";
import { constructFloodingText } from "./construct-flooding-text.js";

const floodDetector = new FloodDetector();

const handleBtcMapUpdate = async (data) => {
  const recipients = await filterRecipients({...data.geo, lat:data.lat, lon:data.lon});
  await notifyRecipients(recipients, data);
};

const sendDirect = async (recipient, data) => {
  const imageUrl = constructNotificationImageUrl({...data, user: recipient});
  const message = constructNotificationText({...data, user: recipient});
  try {
    await sendNotification(imageUrl, message, recipient.id);
  }
  catch (err) {
    await handleNotificationError(err, recipient.id);
    throw err;
  }
};

const sendFlood = async (recipient, dataArray) => {
  const message = constructFloodingText(dataArray, recipient);
  try {
    await sendMessage(message, recipient.id);
  }
  catch (err) {
    await handleNotificationError(err, recipient.id);
    throw err;
  } 
};  

const sendFloodOrDirect = async (recipient, dataArray) => {
  // if only one message, send direct to avoid "flood" message for single update
  if (dataArray.length === 1) 
    await sendDirect(recipient, dataArray[0]);
  else 
    await sendFlood(recipient, dataArray);
};

const floodProtectedSend = async (recipient, data) => {
  floodDetector.detectFlooding(recipient, data, 
    sendDirect,
    sendFloodOrDirect);
}

const notifyRecipients = async (recipients, data) => {
  for (const r of recipients) 
    await floodProtectedSend(r, data);
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