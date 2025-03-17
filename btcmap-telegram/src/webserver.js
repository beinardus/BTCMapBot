import express from "express";
import config from "config";
import bodyParser from "body-parser";
import { dbmanager } from "btcmap-database";
import { handleTextMessage } from "./message-handler.js";
import { logger } from "btcmap-common";
import { CommandError } from "./error-dispatcher.js";
import { sendMessage } from "./notify.js";

const wsConfig = config.get("webserver");
const app = express();

function getUserName(chat) {
  switch (chat.type) {
    case "private":
      return chat.username;
    default:
      // supergroup / channel etc.
      return chat.title;
  }
}

// Middleware for parsing JSON
app.use(bodyParser.json());

// Telegram webhook route
app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    logger.debug(`Received update: ${JSON.stringify(update)}`);

    const message = (update.message || update.channel_post);

    if (!message) {
      // probably some my_chat_member message
      logger.debug("Not an message -> skip");
      res.sendStatus(200); // Respond to Telegram to acknowledge the update
      return;
    }

    const chatId = message.chat.id;

    // store the user if not exists
    await dbmanager.addUser({
      id: chatId,
      name: getUserName(message.chat),
      type: message.chat.type
    });

    // determine the message type using the properties of the message
    if (message.text)
      try {
        await handleTextMessage(message);
      }
      catch (err) {
        if (err instanceof CommandError)
          await sendMessage(err.message, chatId);
      }

    res.sendStatus(200);
  }
  catch (error) {
    logger.error("Error processing webhook", error);
    res.sendStatus(500);
  }
});

function startWebserver() {
  const port = wsConfig.port;
  app.listen(port, () => {
    logger.info(`Web server is running on port ${port}`);
  });
}

export {startWebserver};