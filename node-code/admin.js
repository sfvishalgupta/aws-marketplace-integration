"use strict";
const AWS = require('aws-sdk');
const { SendResponse, logger } = require("./utils");
const {
  AWS_MP,
  STRINGS,
  CHANGE_TYPE
} = require("./constants");

const { catalog, mp_region } = AWS_MP;
AWS.config.update({ region: mp_region });

const mpCatalog = new AWS.MarketplaceCatalog();

const describeMP = async (EntityId) => {
  return mpCatalog.describeEntity({
    Catalog: catalog,
    EntityId
  }).promise();
}

const updateFulfilmentURL = async (Identifier, FulfillmentUrl) => {
  const mpDetails = await describeMP(Identifier);
  let fullfilmentId = null;
  if (typeof mpDetails.DetailsDocument.Versions != "undefined"
    && mpDetails.DetailsDocument.Versions.length > 0
    && mpDetails.DetailsDocument.Versions[0].DeliveryOptions.length > 0
    && typeof mpDetails.DetailsDocument.Versions[0].DeliveryOptions != "undefined"
  ) {
    fullfilmentId = mpDetails.DetailsDocument.Versions[0].DeliveryOptions[0].Id;
  }

  let change = {
    ChangeType: fullfilmentId == null ? CHANGE_TYPE.ADD_DELIVERY_OPTION : CHANGE_TYPE.UPDATE_DELIVERY_OPTION,
    Entity: {
      Type: STRINGS.ENTITY_TYPE_PRODUCT,
      Identifier
    },
    Details: {
      DeliveryOptions: []
    }
  };
  if (fullfilmentId) {
    change.Details.DeliveryOptions.push({
      Id: fullfilmentId,
      Details: {
        SaaSUrlDeliveryOptionDetails: {
          FulfillmentUrl
        }
      }
    });
  } else {
    change.Details.DeliveryOptions.push({
      Details: {
        SaaSUrlDeliveryOptionDetails: {
          FulfillmentUrl
        }
      }
    });
  }
  change.Details = JSON.stringify(change.Details);
  const params = {
    Catalog: catalog,
    ChangeSet: [change]
  };
  logger.debug("update fulfilment url params", {
    data: params
  })
  return mpCatalog.startChangeSet(params).promise();
}

const updateProductInfo = async (Identifier, productInfo) => {
  const details = {};
  details.LogoUrl = productInfo.logoURL;
  details.ShortDescription = productInfo.shortDescription;
  details.LongDescription = productInfo.longDescription;
  details.Highlights = productInfo.highlights;
  details.Categories = productInfo.categories;
  details.SupportDescription = productInfo.supportDescription;
  details.AdditionalResources = productInfo.additionalResources;
  details.SearchKeywords = productInfo.searchKeywords;
  details.Sku = productInfo.sku;
  details.VideoUrls = productInfo.videoUrls;
  details.ProductTitle = productInfo.productTitle;

  return mpCatalog.startChangeSet({
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_INFORMATION,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_PRODUCT,
        Identifier
      },
      Details: JSON.stringify(details)
    }]
  }).promise();
}

const updateAllowedAWSAccount = async (Identifier, BuyerAccounts) => {
  return mpCatalog.startChangeSet({
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_TARGETING,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_PRODUCT,
        Identifier
      },
      Details: JSON.stringify({
        PositiveTargeting: {
          BuyerAccounts
        }
      })
    }]
  }).promise();
}

const updateAllowedCountries = async (Identifier, CountryCodes) => {
  return mpCatalog.startChangeSet({
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_TARGETING,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_PRODUCT,
        Identifier
      },
      Details: JSON.stringify({
        PositiveTargeting: {
          CountryCodes
        }
      })
    }]
  }).promise();
}

const createOffer = async (ProductId) => {
  return mpCatalog.startChangeSet({
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: "CreateOffer",
      Entity: {
        Type: STRINGS.ENTITY_TYPE_OFFER,
      },
      Details: JSON.stringify({ ProductId })
    }]
  }).promise();
}

const listEntitiesOffer = async (ProductId) => {
  return mpCatalog.listEntities({
    Catalog: catalog,
    EntityType: STRINGS.ENTITY_TYPE_OFFER,
    FilterList: [
      {
        Name: "ProductId",
        ValueList : [ProductId]
      }
    ]
  }).promise();
}
exports.handler = async (event) => {
  let result = {
    "Available Actions": [
      STRINGS.ACTION_UPDATE_FULFILMENT
    ]
  };
  logger.info("body", { data: event.body });
  try {
    const request = JSON.parse(event.body);
    logger.info("Got request type", { data: request.type.toLowerCase() });

    switch (request.type.toLowerCase()) {
      case STRINGS.ACTION_UPDATE_FULFILMENT.toLowerCase():
        result = await updateFulfilmentURL(request.entityId, request.data.url);
        break;
      case STRINGS.ACTION_UPDATE_PRODUCT_INFO.toLowerCase():
        result = await updateProductInfo(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_ALLOWED_AWS_ACCOUNT.toLowerCase():
        result = await updateAllowedAWSAccount(request.entityId, request.data.allowedAWSAccounts);
        break;
      case STRINGS.ACTION_UPDATE_ALLOWED_COUNTRIES.toLowerCase():
        result = await updateAllowedCountries(request.entityId, request.data.allowedCountries);
        break;
      case STRINGS.ACTION_CREATE_OFFER.toLowerCase():
        result = await createOffer(request.entityId);
        break;
      case STRINGS.ACTION_GET_PRODUCT_DETAILS.toLowerCase():
        result = await describeMP(request.entityId);
        break;
      case STRINGS.ACTION_GET_OFFER_DETAILS.toLowerCase():
        const offer = await listEntitiesOffer(request.entityId);
        result = await describeMP(offer["EntitySummaryList"][0]["EntityId"]);
        break;
    }
  } catch (e) {
    logger.error("Error", { "data": e.message });
  }
  logger.debug("Result", { data: result });
  return SendResponse(JSON.stringify(result));
}

/** "[
 * {
 * "ChangeType\":\"UpdateInformation\",
 * "Entity\":{\"Type\":\"SaaSProduct@1.0\",\"Identifier\":\"$entityId\"},
 * "Details\":\"{\\\"LogoUrl\\\":\\\"$logoURL\\\",\\\"Categories\\\":$categories,
 * \\\"ProductTitle\\\":\\\"$productTitleNew\\\",\\\"AdditionalResources\\\":[],\\
 * \"LongDescription\\\":$longDescription,\\\"SearchKeywords\\\":$searchKeywords,\\\
 * "ShortDescription\\\":$shortDescription,\\\"SupportDescription\\\":\\\"$supportInfo\\\",
 * \\\"Highlights\\\":$highlights,\\\"Sku\\\":\\\"$productSKU\\\",\\\"VideoUrls\\\":[]}\"}]"\
 * logoURL="https://test-bucket-sf-marketplace.s3.ap-south-1.amazonaws.com/sf.jpeg"
productSKU="test-sku"
highlights="[\\\"highlight 1\\\",\\\"highlight 2\\\",\\\"highlight 3\\\"]"
searchKeywords="[\\\"Keyword 1\\\",\\\"Keyword 2\\\"]"
categories="[\\\"Backup & Recovery\\\"]"
shortDescription="\\\"This is a short Description\\\""
longDescription="\\\"This is a Long Description\\\""
 */
// {
//   "entityType": "Offer@1.0",
//   "changeType": "CreateOffer",
//   "changeName": "CreateOfferChange",
//   "details": "{\"ProductId\":\"prod-ofiabhqu3v2vy\"}"
// }
exports.handler({
  body: JSON.stringify({
    type: "getOfferDetails",
    "entityId": "prod-lp5dq7gziiuyi"
  })
})