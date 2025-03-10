import * as languages from "./src/languages.js";

const {NL, EN} = languages;

const WELCOME = 'welcome'
const GOODBYE = 'goodbye'
const NAME = 'name'
const TOWN = 'town'
const COUNTRY = 'country'

const dictionary = {
  [WELCOME]: {[NL]: "WELKOM", [EN]: "WELCOME"},
  [GOODBYE]: {[NL]: "VAARWEL", [EN]: "GOODBYE"},
  [NAME]: {[NL]: "naam", [EN]: "name" },
  [TOWN]: {[NL]: "plaats", [EN]: "town" },
  [COUNTRY]: {[NL]: "land", [EN]: "country" }
}

const t = (lan, key) => {
  const value = dictionary[lan]?.[key];
  if (value === undefined) {
    return key;
  }

  return value;
};

String.prototype.translate = function(search, lan, key) {
  return this.replace(search, t(lan, key));
};

export {languages, WELCOME, GOODBYE, NAME, TOWN, COUNTRY, t}