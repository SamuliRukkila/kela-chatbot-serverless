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
   * User PIN is confirmed and information will be searched 
   * according to that user by it's PIN from DynamoDB
   */
  if (event.currentIntent.confirmationStatus === 'Confirmed' && slots.Kela_PIN) {

    const dynamoDB = new DynamoDB();

    const pin: string = slots.Kela_PIN;

    await dynamoDB.searchUserByPin(pin).then(res => {
      if (!res.Item) {
        console.error('Could not find user with PIN: ' + pin);
        callback(null, response.returnFailedSearch(true, pin));
      } else {
        console.log('Found user via PIN: ' + res.Item);
        callback(null, response.returnUserInformation(res.Item));
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
