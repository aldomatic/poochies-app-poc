const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');
const xRay = AWSXRay.captureAWS(require('aws-sdk'));
const awsRegion = 'us-west-2';

import { getAllPets, getAllPetsForUser } from './poochDAO'
import { Handler } from 'aws-lambda';

AWS.config.update({
    region: awsRegion,
});

export const handler: Handler = async (event, context) => {

  const method = event.httpMethod;
  let resObject;
  
  if (event.resource === '/pets') {
    const data = await getAllPets();
    resObject = {
        statusCode: 200,
        body: JSON.stringify(data.Items)
    }
  } else if (event.resource === '/pets/user/{userid}') {
      const userid = event.pathParameters?.userid
      if (method === 'GET') {
          const data = await getAllPetsForUser(userid)
          resObject = {
              statusCode: 200,
              body: JSON.stringify(data.Items)
          }
      }
  }
  
  return resObject
}