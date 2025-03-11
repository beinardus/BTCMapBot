import {t, WELCOME, GOODBYE} from "translation";

const createWelcomeMessage = ({name,type,id,user:{language}}) => {
  return `${t(language, WELCOME)}: ${name} (<a href="https://btcmap.org/merchant/${type}:${id}">${id}</a>)`;
}

const createFarewellMessage = ({name,type,id,user:{language}}) => {
  return `${t(language, GOODBYE)}: ${name} (<a href="https://www.openstreetmap.org/${type}/${id}">${id}</a>)`;
}

export { createWelcomeMessage, createFarewellMessage }