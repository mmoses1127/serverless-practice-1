'use strict'
const AWS = require('aws-sdk');

module.exports.getCustomer = async (event) => {
  console.log('event', event);
  let message = event;
  let name = null;
  if (message.Records) {
    message = event.Records[0].Sns.Message;
    name = JSON.parse(message).name;
  } else{
    name = event.name;
  }
  console.log('message', message);
  console.log('Fetching customer with name: ', name);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const getParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      primary_key: name
    }
  };
  const result = await dynamoDb.get(getParams).promise();

  if (!result.Item) {
    console.log('Customer not found');
    return {
      statusCode: 404
    };
  }

  console.log(`Customer found: name: ${result.Item.primary_key}, email: ${result.Item.email}`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      name: result.Item.primary_key,
      email: result.Item.email
    })
  };
}