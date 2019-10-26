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

  /**
   * 1. SCENARIO
   * 
   * User PIN is confirmed and appointments will be searched 
   * according to that user by it's PIN from DynamoDB
   */
  if (event.currentIntent.confirmationStatus === 'Confirmed' && slots.Kela_PIN) {

    const dynamoDB = new DynamoDB();

    const pin: string = slots.Kela_PIN;

    const date: string = moment().tz('Europe/Helsinki').format();

    await dynamoDB.searchAppointmentsByPin(pin, date).then((res: ScanOutput) => {

      // res.Count === 0 if there are no appointments in dynamodb via given PIN
      if (res.Count === 0) {
        console.error('No appointments found via PIN: ' + pin);
        callback(null, response.returnFailedSearch(true, pin));
      } else {
        console.log('Found appointments via PIN: ' + pin);
        let attributes = {};
        if (res.Count === 1) {
          attributes = {
            'APPOINTMENT_ONE': JSON.stringify(res.Items[0]),
            'APPOINTMENT_TWO': null
          };
        } else {
          attributes = {
            'APPOINTMENT_ONE': JSON.stringify(res.Items[0]),
            'APPOINTMENT_TWO': JSON.stringify(res.Items[1])
          };
        }
        callback(null, response.returnAppointments(attributes));
      }
    }).catch(err => {
      console.error(err);
      callback(null, response.returnFailedSearch(false, pin));
    });
  }


  /**
   * 2. SCENARIO
   * 
   * If Lex is doing a validation call for the PIN.
   * Validated PIN will be sent back to LEX in the end.
   */
  else if (event.invocationSource === 'DialogCodeHook' && slots.Kela_PIN) {

    const validator = new ValidatePin();

    // Validate PIN
    validator.validatePin(slots.Kela_PIN);

    // PIN is invalid
    if (validator.invalidPin) {
      return response.returnInvalidPin(validator.pin);
    }

    // Pin is valid and user is required to confirm it
    return response.returnConfirmPin(validator.pin);
  }


  /**
   * 3. SCENARIO
   * 
   * This will (and should) only happen when Lex is doing
   * initialization call.
   */
  else {
    return response.returnDelegate();
  }

};
