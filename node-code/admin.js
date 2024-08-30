"use strict";
const AWS = require('aws-sdk');
const { SendResponse, logger } = require("./utils");
const {
  AWS_MP,
  CHANGE_TYPE,
  EULA_TYPE,
  STRINGS
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

/**
 * This function is used to create new Product in AWS Marketplace type of 
 * SAAS product.
 * @param {*} ProductTitle 
 * @returns 
 */
const createProduct = ProductTitle => {
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.CREATE_PRODUCT,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_PRODUCT
      },
      Details: JSON.stringify({ ProductTitle })
    }]
  }
  logger.debug("Create Product params", { params });
  return mpCatalog.startChangeSet(params).promise();
}

const getOfferId = async (productId) => {
  logger.info("Getting Offer Id from Product Id", { data: productId });
  const result = await mpCatalog.listEntities({
    Catalog: catalog,
    EntityType: STRINGS.ENTITY_TYPE_OFFER_ONLY,
    FilterList: [{
      Name: "ProductId",
      ValueList: [productId]
    }]
  }).promise();
  result["EntitySummaryList"] = result["EntitySummaryList"] || [];
  if (result["EntitySummaryList"].length > 0) {
    return result["EntitySummaryList"][0]["EntityId"];
  }
  return null;
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

const updateAllowedAWSAccount = (Identifier, BuyerAccounts) => {
  const params = {
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
  };
  logger.debug("Update Allowed AWS Account params", { params });
  return mpCatalog.startChangeSet().promise();
}

const updateAllowedCountries = (Identifier, CountryCodes) => {
  let targetCountriesDetails = {};
  if (typeof CountryCodes == "object" && CountryCodes.length > 0) {
    targetCountriesDetails = {
      PositiveTargeting: {
        CountryCodes
      }
    }
  }
  const param = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_TARGETING,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_OFFER,
        Identifier
      },
      Details: JSON.stringify(targetCountriesDetails)
    }]
  };
  logger.debug("Update Allowed Countries", { param });
  return mpCatalog.startChangeSet(param).promise();
}

const createOffer = ProductId => {
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.CREATE_OFFER,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_OFFER,
      },
      Details: JSON.stringify({ ProductId })
    }]
  };
  logger.debug("Create Offer params", { params });
  return mpCatalog.startChangeSet(param).promise();
}



const updateLegalTerm = (OfferId, data) => {
  let EULADocument = {};
  switch (data.type.toLowerCase()) {
    case EULA_TYPE.EULA_STANDARD.toLowerCase():
      EULADocument = {
        Type: EULA_TYPE.EULA_STANDARD,
        Version: data.version
      }
      break;
    case EULA_TYPE.EULA_CUSTOM.toLowerCase():
      EULADocument = {
        Type: EULA_TYPE.EULA_CUSTOM,
        Url: data.url
      }
      break;
  }
  const param = {
    Catalog: catalog,
    ChangeSet: [{
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
    }]
  };
  logger.debug("Update EULA Params", { param });
  return mpCatalog.startChangeSet(param).promise();
}

const updateSupportTerm = (OfferId, RefundPolicy) => {
  const param = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_SUPPORT_TERM,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_OFFER,
        Identifier: OfferId
      },
      Details: JSON.stringify({
        "Terms": [{
          Type: "SupportTerm",
          RefundPolicy
        }]
      })
    }]
  };
  logger.debug("Update Support Term", { param });
  return mpCatalog.startChangeSet(param).promise();
}

const releaseOffer = (Identifier) => {
  const param = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.RELEASE_OFFER,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_OFFER,
        Identifier
      },
      Details: JSON.stringify({})
    }]
  };
  logger.debug("Release Offer Params", { params });
  return mpCatalog.startChangeSet(param).promise();
}

const addDimension = async (ProductId, dimension) => {
  const uid = Date.now();
  dimension.key = dimension.key + "_" + uid
  logger.info("Adding Dimension to product", {
    data: {
      ProductId,
      dimension
    }
  });
  const offerId = await getOfferId(ProductId);
  if (offerId) {
    const dimensionParam = {
      Key: dimension.key,
      Description: dimension.description,
      Name: dimension.name,
      Types: dimension.type,
      Unit: dimension.unit
    };

    const response = await describeMP(offerId);
    const details = JSON.parse(response["Details"]);
    const terms = details["Terms"];
    const termParam = {
      PricingModel: dimension.pricingModel,
      Terms: []
    };

    let updateTerm = {
      "Type": "ConfigurableUpfrontPricingTerm",
      "CurrencyCode": dimension.currencyCode,
      "RateCards": [{
        "Selector": {
          "Type": "Duration",
          "Value": "P1M"
        },
        "Constraints": {
          "MultipleDimensionSelection": dimension.multipleDimensionSelection,
          "QuantityConfiguration": dimension.quantityConfiguration
        },
        "RateCard": []
      }]
    };

    for (const term of terms) {
      if (term["Type"] == "ConfigurableUpfrontPricingTerm") {
        updateTerm = term;
        break
      }
    }
    updateTerm.RateCards[0].RateCard.push({
      "DimensionKey": dimension.key,
      "Price": dimension.price
    })
    termParam.Terms.push(updateTerm);
    logger.debug("Adding Pricing Dimension", { dimensionParam });
    logger.debug("Update offer term", { termParam });

    const addDimensionChangeset = {
      ChangeType: CHANGE_TYPE.ADD_DIMENSION,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_PRODUCT,
        Identifier: ProductId
      },
      Details: JSON.stringify([dimensionParam])
    };

    const updatePricingTermChangeset = {
      ChangeType: CHANGE_TYPE.UPDATE_PRICING_TERM,
      Entity: {
        Type: STRINGS.ENTITY_TYPE_OFFER,
        Identifier: offerId
      },
      Details: JSON.stringify(termParam)
    }
    const changeParam = {
      Catalog: catalog,
      ChangeSet: [addDimensionChangeset, updatePricingTermChangeset]
    };
    logger.debug("Add Pricing Dimension params", { params: changeParam });
    return mpCatalog.startChangeSet(changeParam).promise();
  }
  return null;
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
      // Create API
      case STRINGS.ACTION_CREATE_PRODUCT.toLowerCase():
        result = await createProduct(request.data.productTitle);
        break;
      case STRINGS.ACTION_CREATE_OFFER.toLowerCase():
        result = await createOffer(request.entityId);
        break;

      // Get API
      case STRINGS.ACTION_GET_PRODUCT_DETAILS.toLowerCase():
        result = await describeMP(request.entityId);
        break;
      case STRINGS.ACTION_GET_OFFER_DETAILS.toLowerCase():
        result = await describeMP(request.entityId);
        break;
      case STRINGS.ACTION_GET_OFFER_DETAILS_BY_PRODUCT_ID.toLowerCase():
        result = await getOfferId(request.entityId);
        break;
      // Update api for Products
      case STRINGS.ACTION_UPDATE_FULFILMENT.toLowerCase():
        result = await updateFulfilmentURL(request.entityId, request.data.url);
        break;
      case STRINGS.ACTION_UPDATE_PRODUCT_INFO.toLowerCase():
        result = await updateProductInfo(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_ALLOWED_AWS_ACCOUNT.toLowerCase():
        result = await updateAllowedAWSAccount(request.entityId, request.data.allowedAWSAccounts);
        break;
      case STRINGS.ACTION_ADD_DIMENSION.toLowerCase():
        result = await addDimension(request.entityId, request.data);
        break;

      // Update api for Offers

      case STRINGS.ACTION_UPDATE_ALLOWED_COUNTRIES.toLowerCase():
        console.log("hi")
        result = await updateAllowedCountries(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_SUPPORT_TERM.toLowerCase():
        result = await updateSupportTerm(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_LEGAL_TERM.toLowerCase():
        result = await updateLegalTerm(request.entityId, request.data);
        break;
      case STRINGS.ACTION_RELEASE_OFFER.toLowerCase():
        result = await releaseOffer(request.entityId);
        break;
    }
  } catch (e) {
    logger.error("Error", { "data": e });
    // throw e
  }
  logger.debug("Result", { data: result });
  return SendResponse(JSON.stringify(result));
}

exports.handler({
  body: JSON.stringify(require("./events/create_product.json"))
})