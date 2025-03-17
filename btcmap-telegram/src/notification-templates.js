import {t, WELCOME, GOODBYE} from "translation";

const createWelcomeNotificationText = ({name,type,id,user:{language}}) => {
  return `${t(language, WELCOME)}: ${name} (<a href="https://btcmap.org/merchant/${type}:${id}">${id}</a>)`;
}

const createFarewellNotificationText = ({name,type,id,user:{language}}) => {
  return `${t(language, GOODBYE)}: ${name} (<a href="https://www.openstreetmap.org/${type}/${id}">${id}</a>)`;
}

export { createWelcomeNotificationText, createFarewellNotificationText }