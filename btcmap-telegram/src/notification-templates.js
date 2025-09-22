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
  const {name, city: propCity, geo: {city: geoCity, country_code}} = props;
  const city = propCity || geoCity;

  return `${name}, ${city} (${country_code}) ${createWelcomeUrl(props)}`;
};
    
const createFarewellNotificationFloodText = (props) => {
  const {name, city: propCity, geo: {city: geoCity, country_code}} = props;
  const city = propCity || geoCity;

  return `${name}, ${city} (${country_code}) ${createFarewellUrl(props)}`;
};

export { createWelcomeNotificationText, createFarewellNotificationText, createWelcomeNotificationFloodText, createFarewellNotificationFloodText}