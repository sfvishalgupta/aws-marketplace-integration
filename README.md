# AWS Marketplace - Serverless integration for SaaS products

This project provides example of serverless integration for SaaS products listed on the AWS Marketplace.

## Project Structure

The sample in this repository demonstrates how to use AWS Serverless to integrate your SaaS product with AWS Marketplace and how to perform:

- [Setup product on AWS Marketplace](#setup-market-place)
- [Register new customers](#register-new-customers)
- [Grant and revoke access to your product](#grant-and-revoke-access-to-your-product)
- [Metering for usage](#metering-for-usage)
- [Deploying the sample application using Serverless Command Line Interface](#deploying-code)
- [Admin APIs](#admin-api)

## Setup Market Place
To set up your product on AWS Marketplace, you need to create a product and configure it with the following details
1. Product logo URL (Public bucket Logo URL)
2. End User Licence URL
3. Product Registration URL(fulfilment URL)
4. Metadata about product
5. Support information for product

## Register new customers
With SaaS subscriptions and SaaS contracts, your customers subscribe to your products through AWS Marketplace, but access the product on environment you manage in your AWS account. After subscribing to the product, your customer is directed to a website you create and manage as a part of your SaaS product to register their account and conﬁgure the product.

When creating your product, you provide a URL to your registration landing page. AWS Marketplace uses that URL to redirect customers to your registration landing page after they subscribe. On your software's registration URL, you collect whatever information is required to create an account for the customer. AWS Marketplace recommends collecting your customer’s email addresses if you plan to contact them through email for usage notifications.

The registration landing page needs to be able to identify and accept the x-amzn-marketplace-token token in the form data from AWS Marketplace with the customer’s identiﬁer for billing. It should then pass that token value to the AWS Marketplace Metering Service and AWS Marketplace Entitlement Service APIs to resolve for the unique customer identiﬁer and corresponding product code.

## Deploying Code

## Admin API