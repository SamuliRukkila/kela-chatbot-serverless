import { LexEvent } from '../../classes/LexEvent';
import { Response } from './response';
import { ValidatePin } from '../helper-functions/validators/validatePin';
import { DynamoDB } from '../helper-functions/database/dynamodb';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';

module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  const slots = event.currentIntent.slots;
  const response = new Response();

  /**
   * 1. SCENARIO
   * 
   * User has been verified (by PIN). Slots which'll be given,
   * will be now validated individually.
   */
  if (event.sessionAttributes['Kela_PIN_confirmed']) {
    if (event.currentIntent.confirmationStatus === 'Confirmed' &&
      event.currentIntent.slots.Kela_PIN) {
  
    }
  
  
    else if (event.invocationSource === 'DialogCodeHook' && slots.KELA_PIN) {
    }
  }

  /**
   * 2. SCENARIO
   * 
   * User hasn't been verified yet but the PIN is provided. In this
   * condition the PIN will be verified (before the actual appointment
   * is being made) and saved to session attribute as a valid if the PIN
   * is correct. 
   */
  else if (slots.KELA_PIN) {

    const pinValidator = new ValidatePin();
    const dynamoDB = new DynamoDB();

    pinValidator.validatePin(slots.KELA_PIN);
    
    // User's provided PIN is invalid
    if (pinValidator.invalidPin) {
      return response.returnInvalidPin(pinValidator.pin);
    }

    const pin: string = pinValidator.pin;

    await dynamoDB.searchUserByPin(pin).then((res: GetItemOutput) => {
      if (!res.Item) {
        console.error('Could not find user with PIN: ' + pin);
        callback(null, response.returnNotFoundPin(pin));
      } else {
        console.log('Found user via PIN: ' + res.Item);
        callback(null, response.returnPinSuccess(res.Item));
      }
    }).catch((err: Error) => {
      console.error(err);
      callback(null, response.returnPinError(pin));
    });
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

}
