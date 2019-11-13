import { LexEvent } from '../../classes/LexEvent';
import { Response } from './response';

module.exports.handler = async (event: LexEvent, context: Object, callback: Function) => {

  console.log(event);
  console.log(event.currentIntent);

  let pinAlreadyValidated: boolean; 
  const slots = event.currentIntent.slots;
  const sessionAttributes = event.sessionAttributes || {};

  if (sessionAttributes && sessionAttributes['KELA_PIN']) {
    slots.KELA_PIN = sessionAttributes['KELA_PIN'];
    pinAlreadyValidated = true;
  }

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
  if (sessionAttributes && sessionAttributes.KELA_PIN_OK) {
    // return response.returnStartLocating();
  }

  /**
   * 2. SCENARIO
   * ========================================================
   */
  else {
    return response.returnStartLocating();
  }

}
