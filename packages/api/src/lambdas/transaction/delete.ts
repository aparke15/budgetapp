import dynamoClient from '../../dynamo-client';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event: any) => {
  const transactionId = event.pathParameters;

  const userId = event.requestContext.authorizer.claims.sub;

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `USER#${userId}` },
      SK: { S: `TRANSACTION#${transactionId}` },
    },
  };

  try {
    await dynamoClient.send(new DeleteItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Transaction deleted successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting transaction', error }),
    };
  }
};
