import dynamoClient from '../../dynamo-client';
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event: any) => {

  const accountId = event.pathParameters?.accountId;

  const { accountType, balance } = JSON.parse(event.body);
  
  const userId = event.requestContext.authorizer?.claims.sub;

  const params = {
    TableName: 'BudgetTable',
    Item: {
      PK: { S: `USER#${userId}` },
      SK: { S: `ACCOUNT#${accountId}` },
      accountType: { S: accountType },
      balance: { N: balance.toString() },
    },
  };

  try {
    await dynamoClient.send(new PutItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Account created successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating account', error }),
    };
  }
};
