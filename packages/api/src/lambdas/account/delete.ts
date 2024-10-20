import dynamoClient from '../../dynamo-client';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event: any) => {

  const accountId = event.pathParameters?.accountId;

  const userId = event.requestContext.authorizer?.claims.sub;

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `USER#${userId}` },
      SK: { S: `ACCOUNT#${accountId}` },
    },
  };

  try {
    await dynamoClient.send(new DeleteItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Account deleted successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting account', error }),
    };
  }
};
