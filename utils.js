"use strict";
const winston = require('winston');
const { LOG_LEVEL, REGISTRATION_PAGE_DOMAIN } = require("./constants").ENV_VARS;

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports.SendResponse = body => {
  logger.debug("allowed Origins are", { "data": REGISTRATION_PAGE_DOMAIN });
  return {
    statusCode: 200,
    body,
    headers: {
      'Access-Control-Allow-Origin': REGISTRATION_PAGE_DOMAIN,
      'Access-Control-Allow-Credentials': true,
    }
  };
}


module.exports.logger = logger;