import got from "got";
import config from "config";
import { logger } from "btcmap-common";
import { injectProxy } from "http-utils";
import dotenv from "dotenv";
import { dispatchTelegramError } from "./error-dispatcher.js";

dotenv.config();
const telegramConfig = config.get("telegram");

async function sendMessage(message, chat_id, parse_mode = "html") {
  const url = `${telegramConfig["api-endpoint"]}sendMessage`
    .replace("[TELEGRAM_BOT_TOKEN]", process.env.TELEGRAM_BOT_TOKEN);

  const params = {
    chat_id: chat_id,
    text: message,
    parse_mode: parse_mode,
    disable_web_page_preview: true
  };

  try {
    const options = injectProxy({
      json: params,
      responseType: "json",
    }, config.get("proxy"));

    logger.debug(JSON.stringify(options));
    await got.post(url, options);
    logger.info(`Notification sent to: ${chat_id}`);        
  }
  catch (error) {
    dispatchTelegramError(error);
  }
}

async function sendNotification(image, message, chat_id, parse_mode = "html") {
  const url = `${telegramConfig["api-endpoint"]}sendPhoto`
    .replace("[TELEGRAM_BOT_TOKEN]", process.env.TELEGRAM_BOT_TOKEN);

  const params = {
    chat_id: chat_id,
    photo: image,
    caption: message,
    parse_mode: parse_mode,
    disable_web_page_preview: true
  };

  try {
    const options = injectProxy({
      json: params,
      responseType: "json",
    }, config.get("proxy"));

    logger.debug(JSON.stringify(options));
    await got.post(url, options);
    logger.info(`Notification sent to: ${chat_id}`);        
  }
  catch (error) {
    dispatchTelegramError(error);
  }
}

export {sendNotification, sendMessage};