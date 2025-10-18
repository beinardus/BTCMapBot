import {RequestError} from "got";
import config from "config";
import { CustomError } from "custom-error"

class NominatimError extends CustomError {
  constructor(message, cause) {
    super(message);
    this.name = "NominatimError";
    this.cause = cause;
  }
}

const dispatchNominatimError = (err) => {

  if (err instanceof RequestError && err.message.match(/ECONNREFUSED/) && config.proxy )
    throw new NominatimError("Connection Refused. Proxy misconfigured?", err);

  const errorMessage = err?.response?.body?.message;
  const statusCode = err?.response?.statusCode;

  switch (statusCode) {
    case 401:
      throw new NominatimError("Unauthorized.", err);      
  }

  if (errorMessage)
    throw new NominatimError(`Nominatim API Error (${statusCode}): ${errorMessage}`, err);

  throw err;
};

export { NominatimError, dispatchNominatimError }