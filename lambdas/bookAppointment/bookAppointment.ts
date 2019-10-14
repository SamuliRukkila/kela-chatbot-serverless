import { LexEvent } from '../../classes/LexEvent';
import { Response } from './response';
import { ValidatePin } from '../helper-functions/validators/validatePin';
import { DynamoDB } from '../helper-functions/database/dynamodb';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';
import { ValidateDate } from '../helper-functions/validators/validateDate';

module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  const slots = event.currentIntent.slots;
  const sessionAttributes = event.sessionAttributes;

  const response = new Response();
  
  /**
   * 1. SCENARIO
   * ------------
   * 
   * User has been verified (by PIN). Slots which'll be given,
   * will be now validated individually.
   * 
   * Slots which has been verified will have the verification 
   * saved into @sessionAttributes -variable.
   */
  if (sessionAttributes && sessionAttributes.KELA_PIN_OK) {
    
    /**
     * 1.1 SCENARIO
     * 
     * User has provided date when the appointment should take
     * place. This date will now be validated.
     */
    if (!sessionAttributes.KELA_DATE_OK && slots.KELA_DATE) {
      const dateValidator = new ValidateDate();
      dateValidator.validateDate(slots.KELA_DATE);
      if (dateValidator.invalidDate) {
        return response.returnInvalidSlot('KELA_DATE', dateValidator.message);
      } 
      else {
        return response.returnValidSlot('KELA_DATE', dateValidator.date);
      }
    } 

    /**
     * 
     */
    else if (!sessionAttributes.KELA_LENGTH_OK && slots.KELA_LENGTH ) {

    }

    /**
     * 
     */
    else if (!sessionAttributes.KELA_START_TIME_OK && slots.KELA_START_TIME) {

    }

    /**
     * 
     */
    else if (!sessionAttributes.KELA_REASON_OK && slots.KELA_REASON) {

    }

    /**
     * 
     */
    else if (!sessionAttributes.KELA_INFORMATION_OK && slots.KELA_INFORMATION) {

    } 

    /**
     * 
     */
    else {

    }
  }


  /**
   * 2. SCENARIO
   * ------------
   * 
   * User hasn't been verified yet but the PIN is provided. In this
   * condition the PIN will be verified (before the actual appointment
   * is being made) and saved to session attribute as a valid if the PIN
   * is correct. 
   */
  else if (slots.KELA_PIN) {

    const pinValidator = new ValidatePin();
    
    pinValidator.validatePin(slots.KELA_PIN);
    
    // User's provided PIN is invalid
    if (pinValidator.invalidPin) {
      return response.returnInvalidPin(pinValidator.pin);
    }
    const pin: string = pinValidator.pin;
    
    const dynamoDB = new DynamoDB();

    // Search user by the provided pin from database
    await dynamoDB.searchUserByPin(pin).then((res: GetItemOutput) => {
      // User not found
      if (!res.Item) {
        console.error('Could not find user with PIN: ' + pin);
        callback(null, response.returnNotFoundPin(pin));
      } 
      // User found
      else {
        console.log('Found user via PIN: ' + res.Item);
        callback(null, response.returnPinSuccess(res.Item));
      }
    // Error while searching for user
    }).catch((err: Error) => {
      console.error(err);
      callback(null, response.returnPinError(pin));
    });
  }


  /**
   * 3. SCENARIO
   * ------------
   *
   * This will (and should) only happen when Lex is doing
   * initialization call.
   */
  else {
    return response.returnDelegate();
  }

}
