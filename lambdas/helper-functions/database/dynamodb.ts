const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB();
import { GetItemOutput, QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb';
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

    console.log('Fetching customer from DynamoDB with: ' + pin);

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
   * DynamoDB-function which'll check if there's appointments taken
   * for the user's desired time. It'll only return one value. PIN
   * is returned so we can check if it's the same user who tried to 
   * book the appointment at the same time.
   * 
   * @param {Moment} startDateTime Date (with time) when the user would
   *  want to book the appointment
   * @param {string} type The type of appointment (office/phone). These
   *  types won't overlap each other's appointments so it need to be included.
   * @returns Promise which will return 0-1 overlapping appointment, error if something went wrong 
   */
  public async checkAppointmentsForTime(startDateTime: Moment, type: string): Promise<QueryOutput> {

    const datetime = startDateTime.format().substring(0, 19);

    console.log('Fetching appointments from DynamoDB with: ' + datetime);

    const params: QueryInput = {
      TableName: 'kela-Appointments',
      ProjectionExpression: '#sdt, #p',
      ExpressionAttributeNames: {
        '#t': 'Type',
        '#sdt': 'StartDateTime',
        '#p': 'Pin'
      },
      ExpressionAttributeValues: {
        ':t': { S: type },
        ':dt': { S: datetime }
      },
      KeyConditionExpression: '#t = :t AND #sdt = :dt'
    };

    return await dynamo.query(params).promise();
  }

}