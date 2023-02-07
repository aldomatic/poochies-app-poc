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
          const data = await getAllPetsForUser(username);
          responeData = {
              statusCode: 200,
              body: JSON.stringify(data.Items)
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
// get all pets for a user
async function getAllPetsForUser(userId:string) {
    try {
        const params = {
            TableName: dynamoDBTable,
            IndexName: 'petOwnerIndex',
            KeyConditionExpression: 'pet_owner_userid = :userIdValue',
            ExpressionAttributeValues: {
                ':userIdValue': `user#${userId}`
            }
        };
        return ddbClient.query(params).promise();
    } catch (err) {
        return err;
    }
}