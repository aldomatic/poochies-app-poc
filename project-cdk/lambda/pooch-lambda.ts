const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');

const xRay = AWSXRay.captureAWS(require('aws-sdk'));
import { Handler } from 'aws-lambda';

const table = process.env.DYNAMODB;
const awsRegion = 'us-west-2';

AWS.config.update({
    region: awsRegion,
});

export const handler: Handler = async (event, context) => {

  console.log('event 👉', event);
  
  const method = event.httpMethod;
  
  if (event.resource === '/pets/username/{username}') {
      const username = event.pathParameters?.username;
      if (method === 'GET') {
          return {
              statusCode: 200,
              body: JSON.stringify({message: 'Successful /pets/user/{username}'}),
          }
      }
  }

  return {
    body: JSON.stringify({message: 'Successful /pets'}),
    statusCode: 200,
  };
}