"use strict";
const winston = require('winston');
const nodemailer = require("nodemailer");
const {LOG_LEVEL, REGISTRATION_PAGE_DOMAIN} = require("./constants").ENV_VARS;
const {
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_password,
  smtp_enable_ssl
} = require("./constants").SMTP_SETTINGS;

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports.SendEmail = (to, subject, html) => {
  const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_enable_ssl === "True",
      auth: {
          user: smtp_user,
          pass: smtp_password
      }
  });
  return transporter.sendMail({
      from: smtp_user,
      to,
      subject,
      html,
  });
}

module.exports.SendResponse = body =>{
  logger.debug("allowed Origins are", {"data": REGISTRATION_PAGE_DOMAIN});
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