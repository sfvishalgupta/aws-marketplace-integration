"use strict";

const AWS = require('aws-sdk');
const { aws_region } = require("./constants").ENV_VARS;
const { mp_region } = require("./constants").AWS_MP;
const { MESSAGE_ACTION } = require("./constants");

const marketplaceEntitlementService = new AWS.MarketplaceEntitlementService({
  apiVersion: '2017-01-11',
  region: mp_region
});

const dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: aws_region
});

exports.handler = async (event) => {
  await Promise.all(event.Records.map(async (record) => {
    const { body } = record;
    let { Message: message } = JSON.parse(body);
    if (typeof message === 'string' || message instanceof String) {
      message = JSON.parse(message);
    }
    if (message.action.toLowerCase() === MESSAGE_ACTION.ENTITLEMENT_UPDATED.toLowerCase()) {
      const entitlementParams = {
        ProductCode: message['product-code'],
        Filter: {
          CUSTOMER_IDENTIFIER: [message['customer-identifier']],
        },
      };

      const entitlementsResponse = await marketplaceEntitlementService.getEntitlements(entitlementParams).promise();
      console.log('entitlementsResponse', entitlementsResponse);

      const isExpired = entitlementsResponse.hasOwnProperty("Entitlements") === false || entitlementsResponse.Entitlements.length === 0 ||
        new Date(entitlementsResponse.Entitlements[0].ExpirationDate) < new Date();

      const dynamoDbParams = {
        TableName: process.env.userTable,
        Key: {
          customerIdentifier: { S: message['customer-identifier'] },
        },
        UpdateExpression: 'set entitlement = :e, successfully_subscribed = :ss, subscription_expired = :se',
        ExpressionAttributeValues: {
          ':e': { S: JSON.stringify(entitlementsResponse) },
          ':ss': { BOOL: true },
          ':se': { BOOL: isExpired },
        },
        ReturnValues: 'UPDATED_NEW',
      };
      console.log(dynamoDbParams)
      await dynamodb.updateItem(dynamoDbParams).promise();
    } else {
      console.error('Unhandled action');
      throw new Error(`Unhandled action - msg: ${JSON.stringify(record)}`);
    }
  }));
  return {};
};


// exports.handler(
//   {
//     "Records": [
//         {
//             "EventSource": "aws:sns",
//             "EventVersion": "1.0",
//             "EventSubscriptionArn": "arn:aws:sns:us-east-1:287250355862:aws-mp-entitlement-notification-8p9kre7hksxi66ebncc9j2xdz:2d5ee455-4533-4928-bd73-f3e5373ebd97",
//             "Sns": {
//                 "Type": "Notification",
//                 "MessageId": "e0500bb0-6344-5abb-9203-548eae0316cf",
//                 "TopicArn": "arn:aws:sns:us-east-1:287250355862:aws-mp-entitlement-notification-8p9kre7hksxi66ebncc9j2xdz",
//                 "Subject": null,
//                 "Message": "{\n\"action\": \"entitlement-updated\",\n\"customer-identifier\": \"LBajo9HqLgp\",\n\"product-code\": \"8p9kre7hksxi66ebncc9j2xdz\"\n}",
//                 "Timestamp": "2024-08-20T16:57:43.750Z",
//                 "SignatureVersion": "1",
//                 "Signature": "eePW5IOC+7y3sY1az6U07VolvGp7tfA4QN70aLpbah0v44QofFy9t017A+H1ZkePLJSq0Q1KCnE/bieobSPLWco2eCDMGYyiP1e+aDK2CfDTuMjvabykOovBlDaGjAjs8LIDcsRwSK7CUqzT82REmk94U4prBIPMfslX2LqU/n+acGTo2l6Li8aV6/KkFjJDhPJPjEEep25+Yp45YX3N93FSLPA228TYtxfrLhtJkpUx16lRtUclM0Xrq/F5Rd5+EZ9zDAWgrzuEHSt8eSw0hMbeM7ZFAv85NvZtsIG59+tjR3aGXcSbIyUa52nz9anpZb0sC/nkNG0EC36vBjLgVA==",
//                 "SigningCertUrl": "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-60eadc530605d63b8e62a523676ef735.pem",
//                 "UnsubscribeUrl": "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:287250355862:aws-mp-entitlement-notification-8p9kre7hksxi66ebncc9j2xdz:2d5ee455-4533-4928-bd73-f3e5373ebd97",
//                 "MessageAttributes": {}
//             }
//         }
//     ]
// }
// )