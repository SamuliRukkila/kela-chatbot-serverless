import { ScanOutput } from 'aws-sdk/clients/dynamodb';
import { ValidatePin } from '../helper-functions/validators/validatePin';
import { Response } from './response';
import { DynamoDB } from '../helper-functions/database/dynamodb';
import { LexEvent } from '../../classes/LexEvent';

/**
 * Main function of user information -lambda. At this moment 
 * only LEX will call this function. Function will consist 
 * of three different scenarios which will be distruped by 
 * conditional statement (if, else etc.).
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
   * PIN already exists from previous intent.
   * User information will be searched according 
   * to that user by it's PIN from DynamoDB
   */
  if (event.sessionAttributes.KELA_PIN) {

    const dynamoDB = new DynamoDB();

    const pin: string = event.sessionAttributes.KELA_PIN;

    await dynamoDB.searchUserByPin(pin).then((res: ScanOutput) => {

      if (!res.Items[0]) {
        console.error('Could not find user with PIN: ' + pin);
        callback(null, response.returnFailedSearch(true, pin));
      } else {
        console.log('Found user via PIN: ' + pin);
        callback(null, response.returnUserInformation(res.Items[0]));
      }
    }).catch(err => {
      console.error(err);
      callback(null, response.returnFailedSearch(false, pin));
    });
  }


  /**
   * 2. SCENARIO
   * 
   * User PIN is confirmed and information will be searched 
   * according to that user by it's PIN from DynamoDB
   */
  else if (event.currentIntent.confirmationStatus === 'Confirmed' && slots.KELA_PIN) {

    const dynamoDB = new DynamoDB();

    const pin: string = slots.KELA_PIN;

    await dynamoDB.searchUserByPin(pin).then((res: ScanOutput) => {

      if (!res.Items[0]) {
        console.error('Could not find user with PIN: ' + pin);
        callback(null, response.returnFailedSearch(true, pin));
      } else {
        console.log('Found user via PIN: ' + pin);
        callback(null, response.returnUserInformation(res.Items[0]));
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
    return response.returnDelegate();
  }


};
