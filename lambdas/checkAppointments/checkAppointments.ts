import { ScanOutput, QueryOutput } from 'aws-sdk/clients/dynamodb';
import { ValidatePin } from '../helper-functions/validators/validatePin';
import { Response } from './response';
import { DynamoDB } from '../helper-functions/database/dynamodb';
import { LexEvent } from '../../classes/LexEvent';
import { Moment } from "moment";
const moment = require('moment-timezone');

/**
 * Main function of check appointments -lambda.
 * 
 * @param {Object} event Contains events send by LEX's bot
 */
module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  const slots = event.currentIntent.slots;
  const response = new Response();

  let pinExists: boolean = false;

  if (event.sessionAttributes) {
    if (event.sessionAttributes.hasOwnProperty('KELA_PIN')) {
      pinExists = true;
    }
  }

  /**
   * 1. SCENARIO
   * 
   * PIN already exists from previous intents.
   * Appointments will be searched according to 
   * that user by it's PIN from DynamoDB.
   */
  if (pinExists) {
    console.log('SCENARIO 1.');
    const dynamoDB = new DynamoDB();
    const pin: string = event.sessionAttributes.KELA_PIN;
    const date: Moment = moment().tz('Europe/Helsinki').format();

    await dynamoDB.searchAppointmentsByPin(pin, date).then((res: ScanOutput) => {

      // res.Count === 0 if there are no appointments in dynamodb via given PIN
      if (res.Count === 0) {
        console.error('No appointments found via PIN: ' + pin);
        callback(null, response.returnFailedSearch(true, pin));
      } else {
        console.log('Found appointments via PIN: ' + pin);
        const attributes = [];

        for (let i = 0; i < res.Items.length; i++) {
          console.log(res.Items[i].StartDateTime.S)

          res.Items[i].StartDateTime.S = moment(res.Items[i].StartDateTime.S).format('D.MM.YYYY, H:mm');
          res.Items[i].EndDateTime.S = moment(res.Items[i].EndDateTime.S).format('D.MM.YYYY, H:mm');
          attributes.push(res.Items[i]);
        }
        callback(null, response.returnAppointments(
          {
            appointments: JSON.stringify(attributes),
            pin: pin
          }
        ));
      }
    }).catch(err => {
      console.error(err);
      callback(null, response.returnFailedSearch(false, pin));
    });
  }



  /**
   * 2. SCENARIO
   * 
   * User PIN is confirmed and appointments will be searched 
   * according to that user by it's PIN from DynamoDB
   */
  else if (event.currentIntent.confirmationStatus === 'Confirmed' && slots.KELA_PIN) {
    console.log('SCENARIO 2.');
    const dynamoDB = new DynamoDB();
    const pin: string = slots.KELA_PIN;
    const date: Moment = moment().tz('Europe/Helsinki').format();

    await dynamoDB.searchAppointmentsByPin(pin, date).then((res: ScanOutput) => {

      // res.Count === 0 if there are no appointments in dynamodb via given PIN
      if (res.Count === 0) {
        console.error('No appointments found via PIN: ' + pin);
        callback(null, response.returnFailedSearch(true, pin));
      } else {
        console.log('Found appointments via PIN: ' + pin);
        const attributes = [];
        for (let i = 0; i < res.Items.length; i++) {
          console.log(res.Items[i].StartDateTime.S)

          res.Items[i].StartDateTime.S = moment(res.Items[i].StartDateTime.S).format('D.MM.YYYY, H:mm');
          res.Items[i].EndDateTime.S = moment(res.Items[i].EndDateTime.S).format('D.MM.YYYY, H:mm');
          attributes.push(res.Items[i]);
        }
        callback(null, response.returnAppointments(
          {
            appointments: JSON.stringify(attributes),
            pin: pin
          }
        ));
      }
    }).catch(err => {
      console.error(err);
      callback(null, response.returnFailedSearch(false, pin));
    });
  }


  /**
   * 3. SCENARIO
   * 
   * If Lex is doing a validation call for the PIN.
   * Validated PIN will be sent back to LEX in the end.
   */
  else if (event.invocationSource === 'DialogCodeHook' && slots.KELA_PIN) {
    console.log('SCENARIO 3.');

    const validator = new ValidatePin();

    // Validate PIN
    validator.validatePin(slots.KELA_PIN);

    // PIN is invalid
    if (validator.invalidPin) {
      return response.returnInvalidPin(validator.pin);
    }

    // Pin is valid and user is required to confirm it
    return response.returnConfirmPin(validator.pin);
  }


  /**
   * 4. SCENARIO
   * 
   * This will (and should) only happen when Lex is doing
   * initialization call.
   */
  else {
    console.log('SCENARIO 4.');
    return response.returnDelegate();
  }

};
