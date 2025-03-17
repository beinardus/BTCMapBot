import {RequestError} from "got";
import config from "config";
import { CustomError } from "custom-error";

class BTCMapError extends CustomError {
  constructor(message, cause) {
    super(message);
    this.name = "BTCMapError";
    this.cause = cause;
  }
}

const dispatchBTCMapError = (err) => {

  if (err instanceof RequestError && err.message.match(/ECONNREFUSED/) && config.proxy )
    throw new BTCMapError("Connection Refused. Proxy misconfigured?");

  const errorMessage = err?.response?.body?.description;
  if (errorMessage)
    throw new BTCMapError(`BTCMap API Error: ${errorMessage}`, err);

  throw err;
};

export { dispatchBTCMapError, BTCMapError };