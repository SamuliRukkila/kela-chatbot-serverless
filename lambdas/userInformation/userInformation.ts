import { Validate } from './validate';
import { Response } from './response';
import { DynamoDB } from './dynamodb';
import { LexEvent } from '../../classes/LexEvent';
import { User } from '../../classes/User';

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

  const response = new Response();

  /**
   * 1. SCENARIO
   * 
   * User PIN is confirmed and information will be searched 
   * according to that user by it's PIN from DynamoDB
   */
  if (event.currentIntent.confirmationStatus === 'Confirmed' &&
    event.currentIntent.slots.Kela_PIN) {

    const dynamoDB = new DynamoDB();

    const pin: any = event.currentIntent.slots.Kela_PIN;

    await dynamoDB.searchUserByPin(pin).then(res => {

      if (!res) {
        console.error('Could not find user with PIN: ' + pin);
        callback(null, response.returnFailedSearch(true, pin));
      }
      console.log('Found user: ' + res.Item);
      callback(null, response.returnUserInformation(res.Item));
    }).catch(err => {
      console.error(err);
      callback(null, response.returnFailedSearch(false));
    });

    //   if (ddbRes.err) {
    //     console.error(ddbRes.err);
    //     return response.returnFailedSearch(false);
    //   }
    // if (!ddbRes.res) {
    //   }
  }


  /**
   * 2. SCENARIO
   * 
   * If Lex is doing a validation call for the PIN.
   * Validated PIN will be sent back to LEX in the end.
   */
  else if (event.invocationSource === 'DialogCodeHook' && event.currentIntent.slots.Kela_PIN) {

    const validate = new Validate();

    // Validate PIN
    validate.validatePin(event.currentIntent.slots.Kela_PIN);

    // PIN's length is too short/long
    if (validate.invalidLength === 'short' || validate.invalidLength === 'long') {
      return response.returnInvalidPin({
        pin: validate.pin, errorMessage: `PIN is too ${validate.invalidLength}`
      });
    }

    // PIN's century -symbol is invalid
    if (validate.invalidSymbol) {
      return response.returnInvalidPin({
        pin: validate.pin, errorMessage: `Invalid century -symbol. Possible symbols (- & A)`
      });
    }

    // Pin is valid and user is required to confirm it
    return response.returnConfirmPin(validate.pin);
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
