import { html as format } from "telegram-format";
import { createWelcomeMessage, createFarewellMessage } from "./message-templates.js";
import { locationStatus } from "btcmap-common";
import { UNKNOWN, t } from "translation"

function constructMessage({id, status, name, type, user}) {

  const data = {
    name: format.escape(name??`(${t(user.language, UNKNOWN)})`),
    type,
    user,
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