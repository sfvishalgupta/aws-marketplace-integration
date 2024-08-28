"use strict";

const AWS = require('aws-sdk');
const { logger, SendResponseToContext } = require("./utils.js");
const { REQUEST_TYPE, AWS_MP, CHANGE_TYPE, STRINGS } = require("./constants.js");
const { catalog, mp_region, EntityId: Identifier, EntityARN } = AWS_MP;
const {
  AllowedAWSAccounts: BuyerAccounts,
  ProductInfo,
  Tags
} = require("./product-config.json");

AWS.config.update({ region: mp_region });
const MPCatalog = new AWS.MarketplaceCatalog();
const Entity = {
  Type: STRINGS.ENTITY_TYPE_PRODUCT,
  Identifier
};

module.exports.handler = async (event, context) => {
  try {
    logger.info("REQUEST RECEIVED", { data: JSON.stringify(event) });
    event.RequestType = event.RequestType || REQUEST_TYPE.INIT;
    if (event.RequestType.toLowerCase() === REQUEST_TYPE.DELETE) {
      return SendResponseToContext(event, context, "SUCCESS");
    }

    if (Identifier != "") {
      const details = {
        LogoUrl: ProductInfo.LogoUrl,
        ShortDescription: ProductInfo.ShortDescription
      };

      logger.debug("updating product details", { data: details });
      const ChangeSet = [];
      ChangeSet.push({
        ChangeType: CHANGE_TYPE.UPDATE_INFORMATION,
        Entity,
        Details: JSON.stringify(details)
      });

      // Updating aws allowed account into product
      if (BuyerAccounts.length > 0) {
        logger.info("Updating Targets", { data: BuyerAccounts });
        ChangeSet.push({
          ChangeType: CHANGE_TYPE.UPDATE_TARGETING,
          Entity,
          Details: JSON.stringify({
            PositiveTargeting: {
              BuyerAccounts
            }
          })
        });
      }

      if(ChangeSet.length > 0){
        await MPCatalog.startChangeSet({
          Catalog: catalog,
          ChangeSet
        }).promise();
      }
      
      // Updating Tags into product.
      if (Tags.length > 0) {
        logger.info("Updating Tags", { data: Tags })
        await MPCatalog.tagResource({
          ResourceArn: EntityARN,
          Tags
        }).promise();
      }
    }
  } catch (e) {
    logger.error("Error Message", { data: e.message });
  }
  return SendResponseToContext(event, context, "SUCCESS");
}
