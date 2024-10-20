import dynamoClient from '../../dynamo-client';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent) => {
  const userId = event.pathParameters?.userId;

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `USER#${userId}` },
      SK: { S: `USER#PROFILE` },
    },
  };

  try {
    await dynamoClient.send(new DeleteItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User deleted successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting user', error }),
    };
  }
};
