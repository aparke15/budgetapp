import dynamoClient from '../../dynamo-client';
import { ReturnValue, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event: any) => {
  const { transactionId } = event.pathParameters;  // transactionId comes from the path
  const { amount, description, date } = JSON.parse(event.body);

  const userId = event.requestContext.authorizer.claims.sub;

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: { S: `USER#${userId}` },  // userId from JWT
      SK: { S: `TRANSACTION#${transactionId}` },
    },
    UpdateExpression: 'SET amount = :amount, description = :description, date = :date',
    ExpressionAttributeValues: {
      ':amount': { N: amount.toString() },
      ':description': { S: description || 'No description provided' },
      ':date': { S: date || new Date().toISOString() },
    },
    ReturnValues: 'UPDATED_NEW' as ReturnValue,
  };

  try {
    const result = await dynamoClient.send(new UpdateItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Transaction updated successfully', updatedAttributes: result.Attributes }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating transaction', error }),
    };
  }
};