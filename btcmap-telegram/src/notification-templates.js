import {t, WELCOME, GOODBYE} from "translation";

const createWelcomeUrl = ({type, id}) =>
  `<a href="https://btcmap.org/merchant/${type}:${id}">${id}</a>`;

const createFarewellUrl = ({type, id}) =>
  `<a href="https://www.openstreetmap.org/${type}/${id}">${id}</a>`;

const createWelcomeNotificationText = (props) => {
  const {name,user:{language}} = props;
  return `${t(language, WELCOME)}: ${name} (${createWelcomeUrl(props)})`;
};

const createFarewellNotificationText = (props) => {
  const {name,user:{language}} = props;
  return `${t(language, GOODBYE)}: ${name} (${createFarewellUrl(props)})`;
};

const createWelcomeNotificationFloodText = (props) => {
  const {name, city: propCity, geo: {city: geoCity, town: geoTown, village: village, country_code}} = props;
  const town = propCity || geoCity || geoTown || village;

  return `${name}, ${town} (${country_code}) ${createWelcomeUrl(props)}`;
};
    
const createFarewellNotificationFloodText = (props) => {
  const {name, city: propCity, geo: {city: geoCity, town: geoTown, village: village, country_code}} = props;
  const town = propCity || geoCity || geoTown || village;

  return `${name}, ${town} (${country_code}) ${createFarewellUrl(props)}`;
};

export { createWelcomeNotificationText, createFarewellNotificationText, createWelcomeNotificationFloodText, createFarewellNotificationFloodText}