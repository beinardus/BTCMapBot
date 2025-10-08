import {t, WELCOME, GOODBYE} from "translation";

const createWelcomeUrl = (innerText, {type, id}) =>
  `<a href="https://btcmap.org/merchant/${type}:${id}">${innerText}</a>`;

const createFarewellUrl = (innerText, {type, id}) =>
  `<a href="https://www.openstreetmap.org/${type}/${id}">${innerText}</a>`;

const createWelcomeNotificationText = (props) => {
  const {name,user:{language}} = props;
  return `${t(language, WELCOME)}: ${createWelcomeUrl(name, props)}`;
};

const createFarewellNotificationText = (props) => {
  const {name,user:{language}} = props;
  return `${t(language, GOODBYE)}: ${createFarewellUrl(name, props)}`;
};

const createWelcomeNotificationFloodText = (props) => {
  const {name, city: propCity, geo: {city: geoCity, town: geoTown, village: village, country_code}} = props;
  const town = propCity || geoCity || geoTown || village;
  const summary = `${name}, ${town} (${country_code})`;
  return createWelcomeUrl(summary, props);
};
    
const createFarewellNotificationFloodText = (props) => {
  const {name, city: propCity, geo: {city: geoCity, town: geoTown, village: village, country_code}} = props;
  const town = propCity || geoCity || geoTown || village;
  const summary = `${name}, ${town} (${country_code})`;
  return  createFarewellUrl(summary, props);
};

export { createWelcomeNotificationText, createFarewellNotificationText, createWelcomeNotificationFloodText, createFarewellNotificationFloodText}