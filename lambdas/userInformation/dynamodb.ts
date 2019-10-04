const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';

/**
 * Connects to AWS's DynamoDB to create queries
 */
export class DynamoDB {
  
  /**
   * Gets user information by their PIN
   * 
   * @param {string} pin PIN which identifies the user
   */
  public async searchUserByPin(pin: string): Promise<GetItemOutput> {
    const params = {
      TableName: 'kela-Customers',
      Key: {
        Pin: pin
      }
    };
  
    return await dynamo.get(params).promise();
  }

}