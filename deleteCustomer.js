'use strict'
const AWS = require('aws-sdk')

module.exports.deleteCustomer = async (event) => {
  console.log('event', event)
  let bodyString = event.body;
  if (event.body[-1] === '=') bodyString = Buffer.from(event.body, 'base64').toString();
  console.log('bodyString', bodyString)
  const body = JSON.parse(bodyString)
  const dynamoDb = new AWS.DynamoDB.DocumentClient()
  const deleteParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      primary_key: body.name
    }
  }
  await dynamoDb.delete(deleteParams).promise()

  return {
    statusCode: 200
  }
}