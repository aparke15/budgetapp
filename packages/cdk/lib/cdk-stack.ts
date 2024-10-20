import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';  // import cognito
import * as path from 'path';

export class BudgetAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'MyUserPool', {
      userPoolName: 'BudgetAppUserPool',
      selfSignUpEnabled: true,  // allow users to sign up
      signInAliases: { email: true },  // users can sign in with their email
    });

    // create a Cognito App Client
    const userPoolClient = new cognito.UserPoolClient(this, 'MyUserPoolClient', {
      userPool,
    });

    // API Gateway Cognito authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'MyAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // dynamoDB table
    const table = new dynamodb.Table(this, 'BudgetAppTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // create lambdas (same as before)
    const createAccountLambda = createLambda(this, 'CreateAccountLambda', 'account/create', table.tableArn);
    const deleteAccountLambda = createLambda(this, 'DeleteAccountLambda', 'account/delete', table.tableArn);
    const updateAccountLambda = createLambda(this, 'UpdateAccountLambda', 'account/update', table.tableArn);
    const getAccountLambda = createLambda(this, 'GetAccountLambda', 'account/get', table.tableArn);

    const createUserLambda = createLambda(this, 'CreateUserLambda', 'user/create', table.tableArn);
    const deleteUserLambda = createLambda(this, 'DeleteUserLambda', 'user/delete', table.tableArn);
    const updateUserLambda = createLambda(this, 'UpdateUserLambda', 'user/update', table.tableArn);
    const getUserLambda = createLambda(this, 'GetUserLambda', 'user/get', table.tableArn);

    const createTransactionLambda = createLambda(this, 'CreateTransactionLambda', 'transaction/create', table.tableArn);
    const deleteTransactionLambda = createLambda(this, 'DeleteTransactionLambda', 'transaction/delete', table.tableArn);
    const updateTransactionLambda = createLambda(this, 'UpdateTransactionLambda', 'transaction/update', table.tableArn);
    const getTransactionLambda = createLambda(this, 'GetTransactionLambda', 'transaction/get', table.tableArn);

    // create API Gateway and protect endpoints with Cognito authorizer
    const api = new apigateway.RestApi(this, 'BudgetAppApi');

    // account routes
    const account = api.root.addResource('account');
    account.addMethod('POST', new apigateway.LambdaIntegration(createAccountLambda), {
      authorizer,  // apply the authorizer
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    account.addMethod('DELETE', new apigateway.LambdaIntegration(deleteAccountLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    account.addMethod('PUT', new apigateway.LambdaIntegration(updateAccountLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    account.addMethod('GET', new apigateway.LambdaIntegration(getAccountLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // transaction routes
    const transaction = api.root.addResource('transaction');
    transaction.addMethod('POST', new apigateway.LambdaIntegration(createTransactionLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    transaction.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTransactionLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    transaction.addMethod('PUT', new apigateway.LambdaIntegration(updateTransactionLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    transaction.addMethod('GET', new apigateway.LambdaIntegration(getTransactionLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // user routes
    const user = api.root.addResource('user');
    user.addMethod('POST', new apigateway.LambdaIntegration(createUserLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    user.addMethod('DELETE', new apigateway.LambdaIntegration(deleteUserLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    user.addMethod('PUT', new apigateway.LambdaIntegration(updateUserLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    user.addMethod('GET', new apigateway.LambdaIntegration(getUserLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // grant DynamoDB permissions to lambdas
    table.grantReadWriteData(createAccountLambda);
    table.grantReadWriteData(deleteAccountLambda);
    table.grantReadWriteData(updateAccountLambda);
    table.grantReadWriteData(getAccountLambda);

    table.grantReadWriteData(createTransactionLambda);
    table.grantReadWriteData(deleteTransactionLambda);
    table.grantReadWriteData(updateTransactionLambda);
    table.grantReadWriteData(getTransactionLambda);

    table.grantReadWriteData(createUserLambda);
    table.grantReadWriteData(deleteUserLambda);
    table.grantReadWriteData(updateUserLambda);
    table.grantReadWriteData(getUserLambda);
  }
};

// helper function for creating lambdas
export const createLambda = (
  scope: Construct,
  id: string,
  handlerPath: string,
  tableArn: string,
  memorySize: number = 128,
  timeout: cdk.Duration = cdk.Duration.seconds(5)
) => {
  return new lambda.Function(scope, id, {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: `${handlerPath}.handler`,
    code: lambda.Code.fromAsset(path.join(__dirname, '../../packages/api/src/lambdas')),
    environment: {
      TABLE_NAME: tableArn,
    },
    memorySize: memorySize,
    timeout: timeout,
  });
};
