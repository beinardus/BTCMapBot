import dotenv from "dotenv";

dotenv.config();

function constructNotificationImageUrl({status, name, city: propCity, geo: {city: geoCity, country_code}, user: {language}}) {
  const city = propCity || geoCity;

  const escapedStatus = status ? encodeURIComponent(status) : "";
  const escapedName = name ? encodeURIComponent(name) : "";
  const escapedCity = city ? encodeURIComponent(city) : "";
  const escapedCountry = country_code ? encodeURIComponent(country_code) : "";
  const escapedLanguage = language ? encodeURIComponent(language) : "";

  return `${process.env.IMAGE_GENERATOR_URL}?state=${escapedStatus}&lan=${escapedLanguage}&name=${escapedName}&city=${escapedCity}&country=${escapedCountry}`;
}

export {constructNotificationImageUrl};