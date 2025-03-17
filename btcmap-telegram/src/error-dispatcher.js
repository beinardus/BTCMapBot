import {RequestError} from "got";
import config from "config";
import * as errorCodes from "./telegram-error-codes.js";
import { CustomError } from "custom-error"

class TelegramError extends CustomError {
  constructor(message, cause, errorCode) {
    super(message);
    this.name = "TelegramError";
    this.cause = cause;
    this.errorCode = errorCode;
  }
}

class JsonataError extends CustomError {
  constructor(message, cause) {
    super(message);
    this.name = "JsonataError";
    this.cause = cause;
  }
}

class CommandError extends CustomError {
  constructor(message, cause) {
    super(message);
    this.name = "CommandError";
    this.cause = cause;
  }
}

class CommandAuthError extends CommandError {
  constructor(message, cause) {
    super(message, cause);
    this.name = "CommandAuthError";
  }
}

class CommandArgsError extends CommandError {
  constructor(message, cause) {
    super(message, cause);
    this.name = "CommandArgsError";
  }
}

const dispatchJsonataError = (err) => {
  throw new JsonataError(err.code, err);
};

const dispatchTelegramError = (err) => {

  if (err instanceof RequestError) {

    if (err.message.match(/ECONNREFUSED/) && config.proxy )
      throw new TelegramError("Connection Refused. Proxy misconfigured?", err, errorCodes.CONNECTION_REFUSED);

    const errorMessage = err?.response?.body?.description;
    const statusCode = err?.response?.statusCode;

    switch (statusCode) {
      case 400:
        if (errorMessage?.match(/chat not found/))
          throw new TelegramError("Chat not found", err, errorCodes.INVALID_CHAT);
        break;
        
      case 403:
        if (errorMessage?.match(/bot was blocked by the user/))
          throw new TelegramError("Bot blocked", err, errorCodes.INVALID_CHAT);
        break;
    }
  
    if (errorMessage)
      throw new TelegramError(`Telegram API Error (${statusCode}): ${errorMessage}`, err, errorCodes.UNKNOWN);
  }; 

  throw err;
};

export { dispatchTelegramError, dispatchJsonataError, TelegramError, JsonataError, CommandError, CommandAuthError, CommandArgsError};