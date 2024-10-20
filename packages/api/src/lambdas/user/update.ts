import dynamoClient from '../../dynamo-client';
import { ReturnValue, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event: any) => {
  const { name, email } = JSON.parse(event.body);

  const userId = event.requestContext.authorizer.claims.sub;

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `USER#${userId}` },
      SK: { S: `USER#PROFILE` },
    },
    UpdateExpression: 'SET name = :name, email = :email',
    ExpressionAttributeValues: {
      ':name': { S: name },
      ':email': { S: email },
    },
    ReturnValues: 'UPDATED_NEW' as ReturnValue,
  };

  try {
    await dynamoClient.send(new UpdateItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User updated successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating user', error }),
    };
  }
};
