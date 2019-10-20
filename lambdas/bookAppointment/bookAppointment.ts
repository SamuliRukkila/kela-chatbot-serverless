import { LexEvent } from '../../classes/LexEvent';
import { Response } from './response';
import { ValidatePin } from '../helper-functions/validators/validatePin';
import { DynamoDB } from '../helper-functions/database/dynamodb';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';
import { ValidateDate } from '../helper-functions/validators/validateDate';
import { ValidateLength } from '../helper-functions/validators/validateLength';
import { ValidateStartTime } from '../helper-functions/validators/validateStartTime';

module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  const slots = event.currentIntent.slots;
  const sessionAttributes = event.sessionAttributes;
  const slotDetails = event.currentIntent.slotDetails;

  const response = new Response();
  response.sessionAttributes = sessionAttributes;
  response.slots = slots;
  
  /**
   * 1. SCENARIO
   * ========================================================
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
     * ------------------------------------------------------------------------
     * 
     * User has provided date when the appointment should take
     * place. This date will now be validated.
     */
    if (!sessionAttributes.KELA_DATE_OK && slots.KELA_DATE) {

      console.log('KELA_DATE > Received value: ' + slots.KELA_DATE);

      const validator = new ValidateDate();
      validator.validateDate(slots.KELA_DATE);

      return validator.invalidDate ? 
        response.returnInvalidSlot('KELA_DATE', validator.message) :
        response.returnValidSlot('KELA_DATE', validator.date);
    } 


    /**
     * 1.2 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * User has provided the wanted length for the meeting (15, 30, 40, 60 mins).
     * This value will now be validated. The length won't be saved to DynamoDB,
     * only the ending -time (as UTC-type).
     */
    else if (!sessionAttributes.KELA_LENGTH_OK && (slots.KELA_LENGTH || slotDetails.KELA_LENGTH.originalValue)) {
      
      console.log('KELA_LENGTH > Received value: ' + slots.KELA_LENGTH);

      const validator = new ValidateLength();
      validator.validateLength(slots.KELA_LENGTH);
      
      return validator.invalidLength ?
        response.returnInvalidSlot('KELA_LENGTH', validator.message) :
        response.returnValidSlot('KELA_LENGTH', validator.length);
    }


    /**
     * 1.3 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * 
     */
    else if (!sessionAttributes.KELA_START_TIME_OK && slots.KELA_START_TIME) {

      console.log('KELA_START_TIME > Received value: ' + slots.KELA_START_TIME);
      console.log(typeof slots.KELA_START_TIME);
      const validator = new ValidateStartTime();
      validator.validateStartTime(slots.KELA_START_TIME);

      return validator.invalidTime ?
        response.returnInvalidSlot('KELA_START_TIME', validator.message) :
        response.returnValidSlot('KELA_START_TIME', validator.time);

    }


    /**
     * 1.4 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * 
     */
    else if (!sessionAttributes.KELA_REASON_OK && slots.KELA_REASON) {

    }


    /**
     * 1.5 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * 
     */
    else if (!sessionAttributes.KELA_INFORMATION_OK && slots.KELA_INFORMATION) {

    } 


    /**
     * 1.6 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * 
     */
    else {
      return response.returnDelegate();
    }
  }


  /**
   * 2. SCENARIO
   * ========================================================
   * 
   * User hasn't been verified yet but the PIN is provided. In this
   * condition the PIN will be verified (before the actual appointment
   * is being made) and saved to session attribute as a valid if the PIN
   * is correct. 
   */
  else if (slots.KELA_PIN) {

    console.log('KELA_PIN > Received value: ' + slots.KELA_PIN);

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
        console.log('Found user via PIN: ' + pin);
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
   * ========================================================
   *
   * This will (and should) only happen when Lex is doing
   * initialization call.
   */
  else {
    return response.returnDelegate();
  }

}
