import dynamoClient from '../../dynamo-client';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';  // Use UUIDs for transactionId

export const handler = async (event) => {
  const { accountId } = event.pathParameters;  // accountId comes from the path
  const { amount, type, description, date } = JSON.parse(event.body);

  const userId = event.requestContext.authorizer.claims.sub;

  const transactionId = uuidv4();  // generate a unique transactionId

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: { S: `USER#${userId}` },  // userId from JWT
      SK: { S: `TRANSACTION#${transactionId}` },
      accountId: { S: accountId },
      amount: { N: amount.toString() },
      type: { S: type },
      description: { S: description || 'No description provided' },
      date: { S: date || new Date().toISOString() },  // default to current date if not provided
    },
  };

  try {
    await dynamoClient.send(new PutItemCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Transaction created successfully', transactionId }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating transaction', error }),
    };
  }
};
