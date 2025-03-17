import config from "config";
import { createLogger, transports, addColors, format } from "winston";

const { combine, colorize, printf, timestamp, errors } = format;

addColors({
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green"
});

let logger = createLogger({
  format: combine(
    errors({ stack: true })
  ),
  transports: [
    new transports.Console({
      level: config.get("log-level"),
      format: combine(
        colorize(),
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      )
    })
  ]
});

export { logger };
