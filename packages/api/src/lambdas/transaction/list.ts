import dynamoClient from '../../dynamo-client';
import { QueryCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event: any) => {
  const { transactionId } = event.pathParameters;

  const userId = event.requestContext.authorizer.claims.sub

  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'PK = :userId AND SK = :transactionId',
    ExpressionAttributeValues: {
      ':userId': { S: `USER#${userId}` },
      ':transactionId': { S: `TRANSACTION#${transactionId}` },
    },
  };

  try {
    const result = await dynamoClient.send(new QueryCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items || []),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching transaction', error }),
    };
  }
};
