const winston = require("winston");
const fs = require("fs");

const transports = [
  new winston.transports.Console()
];

// Enable file logging only in development
if (process.env.NODE_ENV !== "production") {

  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }

  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error"
    })
  );

  transports.push(
    new winston.transports.File({
      filename: "logs/combined.log"
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),

  transports
});

module.exports = logger;