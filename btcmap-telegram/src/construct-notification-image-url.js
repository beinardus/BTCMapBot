import dotenv from "dotenv";

dotenv.config();

function constructNotificationImageUrl({status, name, city: propCity, geo: {city: geoCity, town: geoTown, village: village, country_code}, user: {language}}) {
  const town = propCity || geoCity || geoTown || village;

  const escapedStatus = status ? encodeURIComponent(status) : "";
  const escapedName = name ? encodeURIComponent(name) : "";
  const escapedCity = town ? encodeURIComponent(town) : "";
  const escapedCountry = country_code ? encodeURIComponent(country_code) : "";
  const escapedLanguage = language ? encodeURIComponent(language) : "";

  return `${process.env.IMAGE_GENERATOR_URL}?state=${escapedStatus}&lan=${escapedLanguage}&name=${escapedName}&city=${escapedCity}&country=${escapedCountry}`;
}

export {constructNotificationImageUrl};