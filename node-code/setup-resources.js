"use strict";
const { 
  MESSAGE_ACTION, 
  AWS_MP, 
  EMAIL_SUBJECTS, 
  EMAIL_TEMPLATE 
} = require("./constants");
const { SendEmail, logger } = require("./utils");

exports.handler = async (event) => {
  await Promise.all(event.Records.map(async record => {
    try {
      logger.debug("SNS Record is ", { data: record });
      let { Message: message } = record.Sns;
      logger.debug("Message", { data: message });
      let [action, body] = message.split("#");
      if (typeof body === 'string' || body instanceof String) {
        body = JSON.parse(body);
      }
      let emailSubject = "";
      let emailBody = "";

      switch (action.toLowerCase()) {
        case MESSAGE_ACTION.ENTITLEMENT_UPDATED:
          emailSubject = EMAIL_SUBJECTS.ADMIN_ENTITLEMENT_UPDATED;
          emailBody = EMAIL_TEMPLATE.ADMIN_ENTITLEMENT_UPDATED;
          break;
        case MESSAGE_ACTION.SUBSCRIBE_SUCCESS:
          emailSubject = EMAIL_SUBJECTS.ADMIN_USER_SUBSCRIBE;
          break;
        case MESSAGE_ACTION.UNSUBSCRIBE_SUCCESS:
          emailSubject = EMAIL_SUBJECTS.ADMIN_USER_UNSUBSCRIBED;
          break;
        default:
          break;
      }

      logger.debug("Action & Body", { data: { action, body } })
      if (AWS_MP.MarketplaceAdminEmail !== "" && typeof body.contactPerson === 'string') {
        emailBody = emailBody.split("##contactPerson##").join(body.contactPerson);
        await SendEmail(
          AWS_MP.MarketplaceAdminEmail,
          emailSubject,
          emailBody
        );
      }

    } catch (e) {
      logger.error(e.message)
    }
  }))
}