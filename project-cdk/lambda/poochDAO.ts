const AWS = require('aws-sdk');
const ddbClient = new AWS.DynamoDB.DocumentClient();
const dynamoDBTable = process.env.DYNAMODB;

// list all pets
export async function getAllPets() {
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

// get a pet
export async function getPet(petId:string) {
    try {
        const params = {
            TableName: dynamoDBTable,
            KeyConditionExpression: 'pk = :pkValue and begins_with(sk, :skValue)',
            ExpressionAttributeValues: {
                ':pkValue': `pet#`,
                ":skValue": `pet#${petId}`
            },
        };
        return ddbClient.query(params).promise();
    } catch (err) {
        return err;
    }
}


// get all pets for a user`
export async function getAllPetsForUser(userId:string) {
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