import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dotenv from 'dotenv';

// load the appropriate .env file based on NODE_ENV
dotenv.config({ path: process.env.NODE_ENV === 'local' ? '.env.local' : '.env' });

const dynamoClient = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION || 'us-east-1',  // default region
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,  // local or AWS endpoint
});

export default dynamoClient;
