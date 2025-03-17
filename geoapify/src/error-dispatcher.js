import {RequestError} from "got";
import config from "config";
import { CustomError } from "custom-error"

class GeoapifyError extends CustomError {
  constructor(message, cause) {
    super(message);
    this.name = "GeoapifyError";
    this.cause = cause;
  }
}

const dispatchGeoapifyError = (err) => {

  if (err instanceof RequestError && err.message.match(/ECONNREFUSED/) && config.proxy )
    throw new GeoapifyError("Connection Refused. Proxy misconfigured?", err);

  const errorMessage = err?.response?.body?.description;
  const statusCode = err?.response?.statusCode;

  switch (statusCode) {
    case 401:
      throw new GeoapifyError("Unauthorized. Is the Geoapify API key correct?", err);      
  }

  if (errorMessage)
    throw new GeoapifyError(`Geoapify API Error (${statusCode}): ${errorMessage}`, err);

  throw err;
};

export { GeoapifyError, dispatchGeoapifyError }