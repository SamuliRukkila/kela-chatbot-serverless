const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
import { GetItemOutput, ScanInput, QueryInput, QueryOutput, ScanOutput } from 'aws-sdk/clients/dynamodb';
import { DynamoDBAction } from 'aws-sdk/clients/iot';
import { Moment } from 'moment';

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
  public async searchAppointmentsByPin(pin: string): Promise<QueryOutput> {

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
   * @param {Moment} startDate 
   * @param {string} type
   */
  public async checkAppointmentsForDateTime(startDateTime: Moment, type: string): Promise<QueryOutput> {

    const datetime = startDateTime.format();

    console.log('Fetching appointments for: ' + datetime);

    const params: QueryInput = {
      TableName: 'kela-Appointments',
      AttributesToGet: [
        'StartDateTime', 'Type'
      ],
      // ExpressionAttributeValues: {
      //   ':t': { 'S': type },
      //   ':dt': { 'S': datetime }
      // },
      KeyConditionExpression: `Type = ${type} AND begins_with(StartDatetime, ${datetime})`
    };

    return await dynamo.getItem(params).promise();
  }

}