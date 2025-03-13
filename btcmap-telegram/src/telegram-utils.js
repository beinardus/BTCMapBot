import config from "config";
import got from "got";
import dotenv from "dotenv";
import { injectProxy } from "http-utils";
import { logger } from "btcmap-common";
import * as roles from "./telegram-user-roles.js";

dotenv.config();
const telegramConfig = config.get("telegram");

const isAdminRole = (role) => [roles.ADMINISTRATOR, roles.CREATOR, roles.MASTER].some(r => r == role);
const isMasterRole = (role) => role == roles.MASTER;

const getUserRole = async (chatId, userId) => {
  if (userId == process.env.BOT_MASTER_ID)
    return roles.MASTER;

  if (chatId == userId)
    return roles.CREATOR;

  try {
    const url = `${telegramConfig["api-endpoint"]}getChatMember`
      .replace("[TELEGRAM_BOT_TOKEN]", process.env.TELEGRAM_BOT_TOKEN);

    const response = await got.post(url, injectProxy({
      searchParams: {
        chat_id: chatId,
        user_id: userId,
      },
      responseType: "json",
    }, config.get("proxy")));

    logger.debug(response.body);
    return response.body.result.status;
  } 
  catch (error) {
    console.error("Error fetching chat member:", error.message);
    return null;
  }
};

export { getUserRole, isAdminRole, isMasterRole };
