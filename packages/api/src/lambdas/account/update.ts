import dynamoClient from '../../dynamo-client';
import { ReturnValue, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event: any) => {
  
  const accountId = event.pathParameters?.accountId;
  
  const userId = event.requestContext.authorizer?.claims.sub;
  
  const { balance, accountType } = JSON.parse(event.body);

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `USER#${userId}` },
      SK: { S: `ACCOUNT#${accountId}` },
    },
    UpdateExpression: 'SET balance = :balance, accountType = :accountType',
    ExpressionAttributeValues: {
      ':balance': { N: balance.toString() },
      ':accountType': { S: accountType },
    },
    ReturnValues: 'UPDATED_NEW' as ReturnValue,
  };

  try {
    await dynamoClient.send(new UpdateItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Account updated successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating account', error }),
    };
  }
};
