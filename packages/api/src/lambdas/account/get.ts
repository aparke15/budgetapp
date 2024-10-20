import dynamoClient from '../../dynamo-client';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { type APIGatewayEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent) => {

  const accountId = event.pathParameters?.accountId;

  const userId = event.requestContext.authorizer?.claims.sub;

  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'PK = :userId AND SK = :accountId',
    ExpressionAttributeValues: {
      ':userId': { S: `USER#${userId}` },
      ':accountId': { S: `ACCOUNT#${accountId}` },
    },
  };

  try {
    const result = await dynamoClient.send(new QueryCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching account', error }),
    };
  }
};
