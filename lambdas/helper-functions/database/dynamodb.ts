const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
import { GetItemOutput, ScanInput, QueryInput } from 'aws-sdk/clients/dynamodb';
import { DynamoDBAction } from 'aws-sdk/clients/iot';

/**
 * Connects to AWS's DynamoDB to create queries
 */
export class DynamoDB {

  /**
   * Gets user information by their PIN
   * 
   * @param {string} pin PIN which identifies the user
   * @retuns Promise which'll return user information/error
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

  /**
   * Gets user's appointments by their PIN
   * 
   * @param {string} pin PIN which identifies the appointments
   * @retuns Promise which'll return user appointments/error
   */
  public async searchAppointmentsByPin(pin: string) {

    const params = {
      TableName: 'kela-Appointments',
      ProjectionExpression: '#stime, #etime, FirstName, LastName, AppointmentReason',
      FilterExpression: 'Pin = :pin',
      ExpressionAttributeNames: {
        "#stime": "StartDateTime",
        "#etime": "EndDateTime"
      },
      ExpressionAttributeValues: {
        ':pin': pin
      }
    };

    return await dynamo.scan(params).promise();
  }

  /**
   * 
   * @param startDate 
   */
  public async checkAppointmentsForDate(startDate: string): Promise<GetItemOutput> {

    console.log('Fetching appointments for: ' + startDate);

    const params: QueryInput = {
      TableName: 'kela-Appointments',
      KeyConditionExpression: `contains (StartDateTime, ${startDate})`,
      AttributesToGet: [
        'StartDateTime',
        'EndDateTime'
      ]
    }

    return await dynamo.scan(params).promise();
  }

}