import { ScanOutput } from 'aws-sdk/clients/dynamodb';
import { LexEvent } from '../../classes/LexEvent';
import { DynamoDB } from '../helper-functions/database/dynamodb';
import { Response } from './response';

import { BookAppointmentSlots } from '../../classes/BookAppointmentsSlots';
import { BookAppointmentAttributes } from '../../classes/BookAppointmentAttributes';

import { ValidateStartTime } from '../helper-functions/validators/validateStartTime';
import { ValidateDate } from '../helper-functions/validators/validateDate';
import { ValidateType } from '../helper-functions/validators/validateType';
import { ValidatePin } from '../helper-functions/validators/validatePin';
import { ValidateReason } from '../helper-functions/validators/validateReason';


module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  const slots: BookAppointmentSlots = event.currentIntent.slots;
  const sessionAttributes: BookAppointmentAttributes = event.sessionAttributes || {};

  const attributes: { session: boolean, name: string }[] = [
    { session: sessionAttributes.KELA_TYPE_OK, name: 'KELA_TYPE' },
    { session: sessionAttributes.KELA_DATE_OK, name: 'KELA_DATE' },
    { session: sessionAttributes.KELA_START_TIME_OK, name: 'KELA_START_TIME' },
    { session: sessionAttributes.KELA_REASON_OK, name: 'KELA_REASON' }
  ];

  const response = new Response();
  response.sessionAttributes = sessionAttributes;
  response.slots = slots;


  /**
   * 1. SCENARIO
   * ========================================================
   * 
   * User has confirmed the appointment and all the slots are fullfilled 
   * + valid. Appointment will be saved into DynamoDB. All the slots 
   * and session-attributes will be forwarded aswell.
   */
  if (event.currentIntent.confirmationStatus === 'Confirmed' &&
    attributes.every(attr => attr.session)) {

    const dynamoDB = new DynamoDB();
    console.log('User has confirmed the appointment. Saving now..');

    await dynamoDB.createAppointment(slots, sessionAttributes).then(() => {
      console.log('Appointment has been created.');
      callback(null, response.returnSuccessfulAppointment());
    }).catch((err: Error) => {
      console.error(err);
      callback(null, response.returnFailedAppointment());
    });
  }


  /**
   * 2. SCENARIO
   * ========================================================
   * 
   * User has been verified (by PIN). Slots which'll be given,
   * will be now validated individually.
   * 
   * Slots which has been verified will have the verification 
   * saved into @sessionAttributes -variable.
   */
  else if (sessionAttributes && sessionAttributes.KELA_PIN_OK) {

    /**
     * 2.1 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * User has been validated and will now choose the 
     * appointment type which is either office (45 min) or
     * phone -meeting.
     */
    if (!sessionAttributes.KELA_TYPE_OK && slots.KELA_TYPE) {

      console.log('KELA_TYPE > Received value: ' + slots.KELA_TYPE);

      const validator = new ValidateType();
      validator.validateType(slots.KELA_TYPE);

      return validator.invalidType ?
        response.returnInvalidSlot('KELA_TYPE', validator.message) :
        response.returnValidSlot('KELA_TYPE', validator.type);
    }


    /**
     * 2.2 SCENARIO
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
     * 2.3 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * User has provided the wanted start-time for the appointment.
     * This date-time will now be validated. Other previous attributes
     * need to be included in the validation in order to do it properly.
     */
    else if (!sessionAttributes.KELA_START_TIME_OK && slots.KELA_START_TIME) {

      console.log('KELA_START_TIME > Received value: ' + slots.KELA_START_TIME);

      const validator = new ValidateStartTime();
      validator.validateStartTime(slots.KELA_START_TIME, slots.KELA_DATE, slots.KELA_TYPE);

      if (validator.invalidTime) {
        return response.returnInvalidSlot('KELA_START_TIME', validator.message);
      }
      /* Asyncronous validations/checks are separated from synchronous checks 
      since async -checks need more configuration. */ 
      else {
        await validator.isTimeTaken(slots.KELA_PIN).then(() => {
          callback(null, validator.invalidTime ?
            response.returnInvalidSlot('KELA_START_TIME', validator.message) :
            response.returnValidSlot('KELA_START_TIME', slots.KELA_START_TIME)
          );
        });
      }
    }


    /**
     * 2.4 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * User has provided the reason for the appointment. The reason is one 
     * of already provided reasons. Reasn will be quickly validated.
     * 
     * Since this is the last slot, the confirmation prompt for the appointment
     * will also be asked (if all the previous slots are validated).
     */
    else if (!sessionAttributes.KELA_REASON_OK && slots.KELA_REASON) {

      console.log('KELA_REASON > Received value: ' + slots.KELA_REASON);

      const validator = new ValidateReason();
      validator.validateReason(slots.KELA_REASON);

      if (validator.invalidReason) {
        return response.returnInvalidSlot('KELA_REASON', validator.message);
      }
      else {

        // Since this condition can also do the confirmation, add
        // these variables before returning anything
        attributes[3].session = true;
        response.slots['KELA_REASON'] = validator.reason;
        response.sessionAttributes['KELA_REASON_OK'] = true;

        return attributes.every(attr => attr.session) ?
          // Confirmation
          response.returnConfirmAppointment() :
          // Just return validated slot
          response.returnValidSlot('KELA_REASON', validator.reason);
      }
    }


    /**
     * 2.5 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * In theory, this condition should (almost) never occur, because previous
     * slot validation will also call for the confirm of the appointment.
     * However, if it doesn't (in rare occurances), this condition will ensure
     * the proper confirmation from the user will be done.
     * 
     * Every slot has been validated and has been accepted as a valid value.
     * This will send a confirm prompt for the user so it can be to DynamoDB.
     */
    else if (attributes.every(attr => attr.session)) {
      return response.returnConfirmAppointment();
    }


    /**
     * 2.6 SCENARIO
     * ------------------------------------------------------------------------
     * 
     * Something went wrong while validating or giving values
     * to Lex. All the slots are quickly checked and latest empty 
     * slot will asked again.
     * 
     * This usually happens when user provides an incorrect value 
     * for restricted slot.
     */
    else {

      for (let i = 0; i < attributes.length; i++) {
        if (!attributes[i].session) {
          return response.returnUnknownElicitSlot(attributes[i].name);
        }
      }
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
    await dynamoDB.searchUserByPin(pin).then((res: ScanOutput) => {
      // User not found
      if (!res.Items[0]) {
        console.error('Could not find user with PIN: ' + pin);
        callback(null, response.returnNotFoundPin(pin));
      }
      // User found
      else {
        console.log('Found user via PIN: ' + pin);
        callback(null, response.returnPinSuccess(res.Items[0]));
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
