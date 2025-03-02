import dotenv from "dotenv";

dotenv.config();

function constructImageUrl({status, name, city: propCity, geo: {city: geoCity, country_code}}) {
  const city = propCity || geoCity;

  const escapedStatus = status ? encodeURIComponent(status) : "";
  const escapedName = name ? encodeURIComponent(name) : "";
  const escapedCity = city ? encodeURIComponent(city) : "";
  const escapedCountry = country_code ? encodeURIComponent(country_code) : "";

  return `${process.env.IMAGE_GENERATOR_URL}?state=${escapedStatus}&name=${escapedName}&city=${escapedCity}&country=${escapedCountry}`;
}

export {constructImageUrl};