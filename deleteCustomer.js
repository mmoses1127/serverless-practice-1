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

  try {
    await dynamoDb.delete(deleteParams).promise()
  } catch(err) {
    console.log('Error occured while deleting item in DB: ', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error occured while deleting item in DB'
      })
    };
  }


  return {
    statusCode: 200,
    body: JSON.stringify({
      operation: 'DELETE',
      name: body.name
    })
  }
}