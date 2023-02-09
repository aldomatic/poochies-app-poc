import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as path from "path"
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { PolicyStatement, Effect} from 'aws-cdk-lib/aws-iam'

export class ProjectCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // define dynamodb table
    const dynamodb_table = new dynamodb.Table(this, 'Table', {
      billingMode: dynamodb.BillingMode.PROVISIONED,
      partitionKey:{
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING
      },
      readCapacity: 1,
      writeCapacity: 1,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.DESTROY
    })
    
    // add global secondary index
    dynamodb_table.addGlobalSecondaryIndex({
      indexName: 'petBreedsIndex',
      partitionKey: {name: 'pet_breed', type: dynamodb.AttributeType.STRING},
      sortKey: {name: 'pk', type: dynamodb.AttributeType.STRING},
      readCapacity: 1,
      writeCapacity: 1,
      projectionType: dynamodb.ProjectionType.ALL,
    });
    
    dynamodb_table.addGlobalSecondaryIndex({
      indexName: 'petOwnerIndex',
      partitionKey: {name: 'pet_owner_userid', type: dynamodb.AttributeType.STRING},
      sortKey: {name: 'pk', type: dynamodb.AttributeType.STRING},
      readCapacity: 1,
      writeCapacity: 1,
      projectionType: dynamodb.ProjectionType.ALL,
    })
    
    // define lambda function
    const lambda_backend = new NodejsFunction(this, 'poochiesLambda', {
      memorySize: 1024,
      tracing: lambda.Tracing.ACTIVE,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, `/../src/lambda/pooch-lambda.ts`),
      environment: {
        DYNAMODB: dynamodb_table.tableName
      }
    });
    
    // grant lambda function read access to dynamodb table
    dynamodb_table.grantReadWriteData(lambda_backend.role!)
      
        // define apigateway
    const api = new apigateway.RestApi(this, 'poochiesRestAPI', {
      deployOptions: {
        dataTraceEnabled: true,
        tracingEnabled: true
      }
    })
    
    // define endpoint and associate it with a lambda backend
    const endpoint = api.root.addResource('pets')
    
    const petResource = endpoint
      .addResource("{petid}")
      
    const breedResource = endpoint
      .addResource("breed")
      .addResource("{breed}")
      
    const userResource = endpoint
      .addResource("user")
      .addResource("{userid}");
      
    endpoint.addMethod('GET', new apigateway.LambdaIntegration(lambda_backend))
    petResource.addMethod("GET", new apigateway.LambdaIntegration(lambda_backend));
    breedResource.addMethod("GET", new apigateway.LambdaIntegration(lambda_backend));
    userResource.addMethod("GET", new apigateway.LambdaIntegration(lambda_backend));
    
  }
}
