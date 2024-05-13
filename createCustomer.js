	'use strict';
const AWS = require('aws-sdk');

module.exports.createCustomer = async (event) => {
  console.log('event', event);
  let bodyString = event.body;
  if (event.body[-1] === '=') bodyString = Buffer.from(event.body, 'base64').toString();
  console.log('bodyString', bodyString);
  const body = JSON.parse(bodyString);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const putParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key: body.name,
      email: body.email,
    },
  };

  try {
    await dynamoDb.put(putParams).promise();
  } catch(err) {
    console.log('Error occured while putting item in DB: ', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error occured while putting item in DB'
      })
    };
  }

  console.log('DB put process complete. Publishing to SNS...')

  var params = {
    Message: bodyString,
    TopicArn: process.env.NEW_CUSTOMERS_TOPIC_ARN,
  };

  console.log('Publishing to SNS with topic ARN of ' + params.TopicArn);

  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
  .publish(params)
  .promise();

  await publishTextPromise
  .then(function (data) {
    console.log(
      `Message ${params.Message} sent to the topic ${params.TopicArn}`
    );
    console.log("MessageID is " + data.MessageId);
  })
  .catch(function (err) {
    console.log('Error occurred while publishing to SNS topic')
    console.error(err, err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error occurred while publishing to SNS topic'
      })
    };
  });

  console.log('SNS publish process complete')

  return {
    statusCode: 201,
    body: JSON.stringify({
      operation: 'ADD',
      name: body.name,
      email: body.email
    })
  };
};