import * as languages from "./src/languages.js";

const {NL, EN} = languages;

const WELCOME = "welcome"
const GOODBYE = "goodbye"
const NAME = "name"
const TOWN = "town"
const COUNTRY = "country"
const UNKNOWN = "unknown"
const A_NEW_ONE = "a new one"
const AND_GONE = "and gone"

const dictionary = {
  [WELCOME]: {[NL]: "WELKOM", [EN]: "WELCOME"},
  [GOODBYE]: {[NL]: "VAARWEL", [EN]: "GOODBYE"},
  [NAME]: {[NL]: "naam", [EN]: "name" },
  [TOWN]: {[NL]: "plaats", [EN]: "town" },
  [COUNTRY]: {[NL]: "land", [EN]: "country" },
  [UNKNOWN]: {[NL]: "onbekend", [EN]: "unknown" },
  [A_NEW_ONE]: {[NL]: "Een nieuwe!!", [EN]: "A new one!!"},
  [AND_GONE]: {[NL]: "Aaand it's gone!?!", [EN]: "Aaand it's gone!?!"}
}

const t = (lan, key) => {
  const value = dictionary[key]?.[lan];
  if (value === undefined) 
    return key;
  

  return value;
};

String.prototype.translate = function(search, lan, key) {
  return this.replace(search, t(lan, key));
};

export {languages, WELCOME, GOODBYE, NAME, TOWN, COUNTRY, UNKNOWN, A_NEW_ONE, AND_GONE, t}