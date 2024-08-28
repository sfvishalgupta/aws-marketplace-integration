module.exports.ENV_VARS = {
  SupportSNSArn: process.env.SupportSNSARN,
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  aws_region: process.env.aws_region || "ap-south-1",
  REGISTRATION_PAGE_URL: process.env.webpageURL || "https://sourcefuse.com",
  REGISTRATION_PAGE_DOMAIN: process.env.webpageDomain || ""
}

module.exports.SMTP_SETTINGS = {
  "smtp_port": "465",
  "smtp_password": process.env.SMTP_PASSWORD,
  "smtp_user": process.env.SMTP_USER,
  "smtp_host": process.env.SMTP_HOST || "smtp.gmail.com",
  "smtp_enable_ssl": "True"
}

module.exports.AWS_MP = {
  "catalog": "AWSMarketplace",
  "entityType": "SaaSProduct",
  "mp_region": process.env.mp_region || "us-east-1",
  "aws_mp_product_code": process.env.aws_mp_product_code || "57nu7db29fmunuzszlr96ihtt",
  "MarketplaceAdminEmail": process.env.AWSMarketplaceADMIN || ""
}

module.exports.STRINGS = {
  ACTION_UPDATE_PRODUCT_INFO: "updateProductInfo",
  ACTION_UPDATE_FULFILMENT: "updateFulfilment",
  ACTION_UPDATE_ALLOWED_AWS_ACCOUNT: "updateAllowedAWSAccount",
  ACTION_UPDATE_ALLOWED_COUNTRIES: "updateAllowedCountries",
  ACTION_GET_PRODUCT_DETAILS: "getProductDetails",
  ACTION_GET_OFFER_DETAILS: "getOfferDetails",
  ACTION_CREATE_OFFER: "createOffer",
  ENTITY_TYPE_PRODUCT: "SaaSProduct",
  ENTITY_TYPE_OFFER: "Offer"
}

module.exports.CHANGE_TYPE = {
  ADD_DELIVERY_OPTION: "AddDeliveryOptions",
  UPDATE_DELIVERY_OPTION: "UpdateDeliveryOptions",
  UPDATE_INFORMATION: "UpdateInformation",
  UPDATE_TARGETING: "UpdateTargeting"
}

module.exports.MESSAGE_ACTION = {
  ENTITLEMENT_UPDATED: "entitlement-updated",
  SUBSCRIBE_SUCCESS: "subscribe-success",
  UNSUBSCRIBE_SUCCESS: "unsubscribe-success"
}

module.exports.EMAIL_SUBJECTS = {
  CUSTOMER_ONBOARD: "Welcome Email from SAAS Product",
  ADMIN_ENTITLEMENT_UPDATED: "Entitlement Updated!",
  ADMIN_USER_SUBSCRIBE: "New User Subscribed!",
  ADMIN_USER_UNSUBSCRIBED: "User UnSubscribed!",
}

module.exports.EMAIL_TEMPLATE = {
  CUSTOMER_ONBOARD: '"<!DOCTYPE html><html><head><title>Welcome ##contactPerson##!<\/title><\/head><body><h1>Welcome ##contactPerson## !<\/h1><p>Thanks for purchasing<\/p><p>We\u2019re thrilled to have you on board. Our team is hard at work setting up your account, please expect to hear from a member of our customer success team soon<\/p><\/body><\/html>',
  ADMIN_ENTITLEMENT_UPDATED: '"<!DOCTYPE html><html><head><title>ENTITLEMENT Updated from ##contactPerson##!<\/title><\/head><body><h1>Entitlement Updated from ##contactPerson## !<\/h1><\/body><\/html>'
}