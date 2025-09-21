import { locationStatus } from "btcmap-common";
import { createWelcomeNotificationText, createFarewellNotificationText } from "./notification-templates.js";
import { ALSO_CREATED, ALSO_DELETED, t } from "translation"

function constructFloodingText(dataArray, user) {
  // split array on status
  const grouped = dataArray.reduce((a, c) => {
    (a[c.status] ??=[]).push(c);
    return a;
  }, {});

  const created = grouped[locationStatus.CREATE];
  const welcomeText = created.map(data => createWelcomeNotificationText({...data, user})).join("\n");

  const deleted = grouped[locationStatus.DELETE]
  const goodbyeText = deleted.map(data => createFarewellNotificationText({...data, user})).join("\n");

  let message = "";
  if (created.length)
    message += `<strong>${t(user.language, ALSO_CREATED)}</strong>\n${welcomeText}`;

  if (deleted.length) {
    if (message.length) message += "\n\n";
    message += `<strong>${t(user.language, ALSO_DELETED)}</strong>\n${goodbyeText}`;
  }

  return message;
}

export {constructFloodingText}