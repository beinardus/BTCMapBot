import { html as format } from "telegram-format";
import { createWelcomeNotificationText, createFarewellNotificationText } from "./notification-templates.js";
import { locationStatus } from "btcmap-common";
import { UNKNOWN, t } from "translation"

function constructNotificationText({id, status, name, type, user}) {

  const data = {
    name: format.escape(name??`(${t(user.language, UNKNOWN)})`),
    type,
    user,
    id
  }

  switch (status) {
    case locationStatus.CREATE:
      return createWelcomeNotificationText(data);

    case locationStatus.DELETE:
      return createFarewellNotificationText(data);

    default:
      return `Unknown status: ${status}`
  }
}

export {constructNotificationText};