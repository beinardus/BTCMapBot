import zmq from "zeromq";
import config from "config";
import dotenv from "dotenv";
import { logger } from "btcmap-common";
import { startWebserver } from "./webserver.js";
import { handleBtcMapUpdate } from "./btcmap-update.js";

dotenv.config();
const zmqConfig = config.get("zmq");

async function startClient() {
  const subscriber = new zmq.Subscriber();

  try {
    // Connect to the publisher's address
    subscriber.connect(zmqConfig.url); // Adjust the address and port as needed
    logger.info(`Subscriber connected to publisher ${zmqConfig.url}`);
    logger.info(`Image generator located at: ${process.env.IMAGE_GENERATOR_URL}`);

    // Subscribe to all messages
    subscriber.subscribe("");
    logger.info("Subscribed to all messages");

    // Listen for messages from the publisher
    for await (const [zmqMessage] of subscriber) 
      try {
        const jsonData = zmqMessage.toString();

        logger.debug(`Received zmq data: ${jsonData}`);
        await handleBtcMapUpdate(JSON.parse(jsonData));
      }
      catch (err) {
        logger.error("Failed to handle the ZMQ message", err);
      }
  }
  catch (err) {
    logger.error("Error in ZMQ Subscriber", err);
  }
}

startWebserver();
startClient();
