module.exports.ENV_VARS = {
  SupportSNSArn: "",
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
  "aws_mp_product_code": process.env.aws_mp_product_code || "57nu7db29fmunuzszlr96ihtt"
}

module.exports.STRINGS = {
  ACTION_UPDATE_PRODUCT_INFO: "updateProductInfo",
  ACTION_UPDATE_FULFILMENT: "updateFulfilment",
  ACTION_UPDATE_ALLOWED_AWS_ACCOUNT: "updateAllowedAWSAccount",
  ACTION_UPDATE_ALLOWED_COUNTRIES: "updateAllowedCountries",
  ACTION_GET_PRODUCT_DETAILS: "getProductDetails",
  ACTION_GET_OFFER_DETAILS: "getOfferDetails",
  ACTION_CREATE_OFFER:"createOffer",
  ENTITY_TYPE_PRODUCT: "SaaSProduct",
  ENTITY_TYPE_OFFER: "Offer"
}

module.exports.CHANGE_TYPE = {
  ADD_DELIVERY_OPTION: "AddDeliveryOptions",
  UPDATE_DELIVERY_OPTION: "UpdateDeliveryOptions",
  UPDATE_INFORMATION: "UpdateInformation",
  UPDATE_TARGETING: "UpdateTargeting"
}