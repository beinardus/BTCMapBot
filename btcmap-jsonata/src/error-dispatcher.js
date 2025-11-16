import { CustomError } from "custom-error"

class JsonataError extends CustomError {
  constructor(message, cause) {
    super(message);
    this.name = "JsonataError";
    this.cause = cause;
  }
}

const dispatchJsonataError = (err) => {
  throw new JsonataError(err.code, err);
};

export { dispatchJsonataError, JsonataError};