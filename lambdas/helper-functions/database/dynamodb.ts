const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB();
const moment = require('moment-timezone');

import { QueryInput, QueryOutput, ScanOutput, ScanInput, PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { Moment } from 'moment';
import { BookAppointmentSlots } from '../../../classes/BookAppointmentsSlots';
import { BookAppointmentAttributes } from '../../../classes/BookAppointmentAttributes';
import { PutItemInput } from 'aws-sdk/clients/iot';

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
  public async searchUserByPin(pin: string): Promise<ScanOutput> {

    console.log('Fetching customer from DynamoDB with: ' + pin);

    const params: ScanInput = {
      TableName: 'kela-Customers',
      FilterExpression: 'Pin = :pin',
      ExpressionAttributeValues: {
        ':pin': { S: pin }
      }
    };

    return await dynamo.scan(params).promise();
  }


  /**
   * Gets user's appointments by their PIN
   * 
   * @param {string} pin PIN which identifies the appointments
   * @retuns Promise which'll return user appointments/error
   */
  public async searchAppointmentsByPin(pin: string, dateTime: Moment): Promise<ScanOutput> {

    const params = {
      TableName: 'kela-Appointments',
      FilterExpression: 'Pin = :pin AND StartDateTime >= :sdt',
      ExpressionAttributeValues: {
        ':pin': { S: pin },
        ':sdt': { S: dateTime }
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
   * @returns Promise which will return 0-1 overlapping appointment, 
   *  error if something went wrong 
   */
  public async checkAppointmentsForTime(startDateTime: Moment, type: string): Promise<QueryOutput> {

    const datetime = startDateTime.format('YYYY-MM-DDTHH:mm:ss');

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

  /**
   * DynamoDB -function which'll insert new appointment 
   * into DynamoDB. All the needed values come from parameters.
   * 
   * @param {BookAppointmentSlots} slots All slots
   * @param {BookAppointmentAttributes} slots Attributes which 
   *  includes first- & last name
   * @returns Empty promise for if creation was successful
   */
  public async createAppointment(slots: BookAppointmentSlots, 
      attributes: BookAppointmentAttributes): Promise<null> {
    
    // Convert date-times for the DynamoDB
    const startDateTime = moment(
      slots.KELA_DATE + ' ' + slots.KELA_START_TIME)
        .format('YYYY-MM-DDTHH:mm:ss');

    const params: any = {
      TableName: 'kela-Appointments',
      Item: {
        'Type': { S: slots.KELA_TYPE },
        'Pin': { S: slots.KELA_PIN },
        'AppointmentReason': { S: slots.KELA_REASON }, 
        'StartDateTime': { S: startDateTime },
        'FirstName': { S: attributes.KELA_FIRSTNAME },
        'LastName': { S: attributes.KELA_LASTNAME },
      }
    }

    return await dynamo.putItem(params).promise();

  }

}