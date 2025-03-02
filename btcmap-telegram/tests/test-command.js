import { handleTextMessage } from "../src/message-handler.js";
import dotenv from "dotenv";

dotenv.config();
const masterId = process.env.BOT_MASTER_ID;

const message = {
  chat: { id: masterId },
  from: { id: masterId },
  //text: "/listusers"
  //text: `/sendmessage ${masterId} pm=markDown *Hello* world!`
  //text: `/sendmessage ${masterId} markDown *Hello* world!`
  text: `/sendmessage ${masterId} pm=html markDown *Hello* world!`
};

await handleTextMessage(message);