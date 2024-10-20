import dynamoClient from '../../dynamo-client';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event: any) => {
  const { transactionId } = event.pathParameters;

  const userId = event.requestContext.authorizer.claims.sub

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `USER#${event.requestContext.authorizer.claims.sub}` },  // userId from JWT
      SK: { S: `TRANSACTION#${transactionId}` },
    },
  };

  try {
    const result = await dynamoClient.send(new GetItemCommand(params));
    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Transaction not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching transaction', error }),
    };
  }
};
