import jsonata from "jsonata";
import { dispatchJsonataError } from "./error-dispatcher.js";

function createJsonata(filter) {
  try {
    return jsonata(filter);
  }
  catch (err) {
    dispatchJsonataError(err);
  }
}

export { createJsonata }