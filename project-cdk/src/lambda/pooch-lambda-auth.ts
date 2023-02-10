const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');
const xRay = AWSXRay.captureAWS(require('aws-sdk'));
const awsRegion = 'us-west-2';

import { Handler, PolicyDocument } from 'aws-lambda';

AWS.config.update({
    region: awsRegion,
});

export const handler: Handler = async (event, context) => {
  console.log(event)
 
  let token = event.authorizationToken
  
  let effect = 'Deny'
  
  if (token == process.env.SECRET_VALUE) {
        effect = 'Allow'
  } else {
    effect = 'Deny'
  }
  let policy = {
    "principalId": "user",
    "policyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "execute-api:Invoke",
          "Effect": effect,
          "Resource": '*'
        }
      ]
    }
  }
    
  return policy
}