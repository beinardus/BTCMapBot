import { html as format } from 'telegram-format';
import { createWelcomeMessage, createFarewellMessage } from './message-templates.js';
import { locationStatus } from "btcmap-common";

function constructMessage({id, status, name, type}) {

  const data = {
    name: format.escape(name??"onbekend"),
    type, 
    id
  }

  switch (status) {
    case locationStatus.CREATE:
      return createWelcomeMessage(data);

    case locationStatus.DELETE:
      return createFarewellMessage(data);

    default:
      return `Unknown status: ${status}`
  }
}

export {constructMessage};