"use strict";

const AWS = require('aws-sdk');
const {
  logger,
  SendResponseToContext
} = require("./utils.js");

const {
  AWS_MP,
  CHANGE_TYPE,
  EULA_TYPE,
  REQUEST_TYPE,
  STRINGS,
} = require("./constants.js");

const {
  catalog: Catalog,
  mp_region,
  EntityId: Identifier,
  EntityARN,
  OfferId
} = AWS_MP;

const {
  AllowedCountries,
  AllowedAWSAccounts: BuyerAccounts,
  EULA_URL,
  RefundPolicy,
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
    event.ResourceProperties = event.ResourceProperties || {};
    if (event.RequestType.toLowerCase() === REQUEST_TYPE.DELETE && event.ResourceProperties.key === "V0") {
      return SendResponseToContext(event, context, "SUCCESS");
    }

    if (Identifier != "") {
      const details = ProductInfo;
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

      if (ChangeSet.length > 0) {
        await MPCatalog.startChangeSet({
          Catalog,
          ChangeSet,
          Intent: "APPLY"
        }).promise();
      }
    }

    if (EntityARN.length > 0) {
      // Updating Tags into product.
      if (Tags.length > 0) {
        logger.info("Updating Tags", { data: Tags })
        await MPCatalog.tagResource({
          ResourceArn: EntityARN,
          Tags
        }).promise();
      }
    }

    if (OfferId.length > 0) {
      const OfferChangeSet = [];
      if (RefundPolicy.length > 0) {
        logger.info("Updating Support Term", { data: RefundPolicy });
        OfferChangeSet.push({
          ChangeType: CHANGE_TYPE.UPDATE_SUPPORT_TERM,
          Entity: {
            Type: STRINGS.ENTITY_TYPE_OFFER,
            Identifier: OfferId
          },
          Details: JSON.stringify({
            "Terms": [{ "Type": "SupportTerm", "RefundPolicy": RefundPolicy }]
          })
        });
      }

      logger.info("Update allowed countries for offer", {
        data:
          AllowedCountries
      });

      let targetCountriesDetails = {};
      if (AllowedCountries.length > 0) {
        targetCountriesDetails = {
          PositiveTargeting: {
            CountryCodes: AllowedCountries
          }
        }
      }

      OfferChangeSet.push({
        ChangeType: CHANGE_TYPE.UPDATE_TARGETING,
        Entity: {
          Type: STRINGS.ENTITY_TYPE_OFFER,
          Identifier: OfferId
        },
        Details: JSON.stringify(targetCountriesDetails)
      });

      // Updating EULA URL into offer.
      let EULADocument = {
        "Type": EULA_TYPE.EULA_STANDARD
      }
      if (EULA_URL.length > 0) {
        EULADocument = {
          "Type": EULA_TYPE.EULA_CUSTOM,
          "Url": EULA_URL
        }
      }

      OfferChangeSet.push({
        ChangeType: CHANGE_TYPE.UPDATE_LEGAL_TERM,
        Entity: {
          Type: STRINGS.ENTITY_TYPE_OFFER,
          Identifier: OfferId
        },
        Details: JSON.stringify({
          "Terms": [{
            "Type": "LegalTerm",
            "Documents": [EULADocument]
          }]
        })
      });

      if (OfferChangeSet.length > 0) {
        logger.info("Offer Change Set is", { data: OfferChangeSet });
        await MPCatalog.startChangeSet({
          Catalog,
          ChangeSet: OfferChangeSet,
          Intent: "APPLY"
        }).promise();
      }


    }
  } catch (e) {
    logger.error("Error Message", { data: e.message });
  }
  return SendResponseToContext(event, context, "SUCCESS");
}
