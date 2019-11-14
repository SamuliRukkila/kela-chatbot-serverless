import { LexEvent } from '../../classes/LexEvent';
import { Response } from './response';
import { ValidatePin } from '../helper-functions/validators/validatePin';
import { DynamoDB } from '../helper-functions/database/dynamodb';
import { ScanOutput } from 'aws-sdk/clients/dynamodb';
import { ValidateSendType } from '../helper-functions/validators/validateSendType';
import { SendDirections } from './sendDirections';

module.exports.handler = async (event: LexEvent, 
  context: Object, callback: Function) => {

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
   */
  if (sessionAttributes && slots.KELA_PIN && sessionAttributes.KELA_PIN_OK &&
      !sessionAttributes.KELA_SEND_TYPE_OK && slots.KELA_SEND_TYPE) {

      console.log('KELA_SEND_TYPE > Received value: ' + slots.KELA_SEND_TYPE);

      const validator = new ValidateSendType();
      validator.validateSendType(slots.KELA_SEND_TYPE);
      
      if (validator.invalidSendType) {
        return response.returnInvalidSendType();
      }
      else {
        const sendDirections = new SendDirections();
        await sendDirections.sendDirections(
          validator.sendType, '+358407159358', 'samuli.rukkila@hotmail.fi')
            .then(() => {
              console.log('Message were send to user via: ' + validator.sendType);
              callback(null, response.returnDirectionsSent());
            }).catch(err => {
              console.error(err);
              callback(null, response.returnDirectionsSentFailed());
            });
      }
  }

  /**
   * 2. SCENARIO
   * ========================================================
   *
   */
  else if (event.currentIntent.confirmationStatus === 'Confirmed' 
    && slots.KELA_PIN) {

    let pin: string;

    if (pinAlreadyValidated) {
      pin = slots.KELA_PIN;
    } 
    else {
      const pinValidator = new ValidatePin();
      pinValidator.validatePin(slots.KELA_PIN);

      // User's provided PIN is invalid
      if (pinValidator.invalidPin) {
        return response.returnInvalidPin(pinValidator.pin);
      }
      pin = pinValidator.pin;
    }

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
   *
   */
  else if (event.currentIntent.confirmationStatus === 'Confirmed') {
    return response.returnElicitPin();
  }


  /**
   * 3. SCENARIO
   * ========================================================
   */
  else {
    return response.returnStartLocating();
  }

}
