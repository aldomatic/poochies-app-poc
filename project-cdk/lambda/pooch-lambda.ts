const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');

const ddbClient = new AWS.DynamoDB.DocumentClient();

const xRay = AWSXRay.captureAWS(require('aws-sdk'));
import { Handler } from 'aws-lambda';

const dynamoDBTable = process.env.DYNAMODB;
const awsRegion = 'us-west-2';

AWS.config.update({
    region: awsRegion,
});

export const handler: Handler = async (event, context) => {

  console.log('event 👉', event);
  
  const method = event.httpMethod;
  let responeData;
  
  if (event.resource === '/pets') {
    const data = await getAllPets();
    responeData = {
        statusCode: 200,
        body: JSON.stringify(data.Items)
    }
  } else if (event.resource === '/pets/username/{username}') {
      const username = event.pathParameters?.username;
      if (method === 'GET') {
          responeData = {
              statusCode: 200,
              body: JSON.stringify({message: `Successful /pets/user/${username}`}),
          }
      }
  }
  
  return responeData
}


// list all pets
async function getAllPets() {
    try {
        const params = {
            TableName: dynamoDBTable,
            KeyConditionExpression: 'pk = :pkValue',
            ExpressionAttributeValues: {
                ':pkValue': `pet#`
            },
        };
        return ddbClient.query(params).promise();
    } catch (err) {
        return err;
    }
}