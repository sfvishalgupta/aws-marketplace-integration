"use strict";
const aws_region = process.env.aws_region;
const AWS = require('aws-sdk');
const marketplacemetering = new AWS.MarketplaceMetering({ apiVersion: '2016-01-14', region: aws_region });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: aws_region });

exports.handler = async (event, context) => {
    console.log(event.body);
  const {
    // Accept form inputs from ../web/index.html
    regToken, companyName, contactPerson, contactPhone, contactEmail,
  } = JSON.parse(event.body);
  if (regToken && companyName && contactPerson && contactPhone && contactEmail) {
    try {
      // Call resolveCustomer to validate the subscriber
      const resolveCustomerParams = {
        RegistrationToken: regToken,
      };

      const resolveCustomerResponse = await marketplacemetering
      .resolveCustomer(resolveCustomerParams)
      .promise();

      const { CustomerIdentifier, ProductCode, CustomerAWSAccountId } = resolveCustomerResponse;
      const datetime = new Date().getTime().toString();
      const dynamoDbParams = {
        TableName: process.env.userTable,
        Item: {
          companyName: { S: companyName },
          contactPerson: { S: contactPerson },
          contactPhone: { S: contactPhone },
          email: { S: contactEmail },
          customerIdentifier: { S: CustomerIdentifier },
          productCode: { S: ProductCode },
          customerAWSAccountID: { S: CustomerAWSAccountId },          
          created: { S: datetime },
        },
      };

      await dynamodb.putItem(dynamoDbParams).promise();

    }
    catch (error) {
      console.error(error);
    }
  }
  const response = {
      statusCode: 200,
      body: event.body,
      headers: {
        'Access-Control-Allow-Origin': process.env.webpageURL,
        'Access-Control-Allow-Credentials': true,
      }
  };
  return response;
};