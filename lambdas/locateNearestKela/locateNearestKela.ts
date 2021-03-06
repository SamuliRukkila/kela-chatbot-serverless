import { LexEvent } from '../../classes/LexEvent';
import { Response } from './response';
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
  const sessionAttributes = event.sessionAttributes || {};

  const response = new Response();
  response.sessionAttributes = sessionAttributes;
  response.slots = slots;

  // If user is already logged in
  if (sessionAttributes && sessionAttributes['KELA_PIN']) {
    response.sessionAttributes['KELA_PIN'] = sessionAttributes['KELA_PIN'];
    response.sessionAttributes['KELA_PIN_OK'] = true;
    pinAlreadyValidated = true;
  }


  /**
   * 1. SCENARIO
   * ========================================================
   * 
   * User rejects the sending of the directions. Intent
   * will now be stopped.
   */
  if (event.currentIntent.confirmationStatus === 'Denied') {
    return response.returnRejectDirections();
  }

  /**
   * 2. SCENARIO
   * ========================================================
   *  
   * User has been validated by PIN and has told Lex/Sumerian the
   * preferred way of sending the directions (phone/email).
   * 
   * Send-type will be firstly validated, and if it's valid, instructions
   * will be send for the user.
   */
  if (sessionAttributes && slots.KELA_PIN && sessionAttributes.KELA_PIN_OK &&
    !sessionAttributes.KELA_SEND_TYPE_OK && slots.KELA_SEND_TYPE) {

    console.log('KELA_SEND_TYPE > Received value: ' + slots.KELA_SEND_TYPE);
    const dynamoDB = new DynamoDB();

    await dynamoDB.getUserLatestDirectionURL(slots.KELA_PIN).then((res: ScanOutput) => {

      // If no data were found
      if (res.Count === 0 || !res.Items[0].LatestDirectionURL) {
        console.error('Could not find directions for PIN: ' + slots.KELA_PIN);
        callback(null, response.returnDirectionsSentFailed());
      } 
      else {

        const directionURL: string = res.Items[0].LatestDirectionURL.S;
        console.log('Found saved directions: ' + directionURL);
  
        const validator = new ValidateSendType();
        validator.validateSendType(slots.KELA_SEND_TYPE);
  
        if (validator.invalidSendType) {
          callback(null, response.returnInvalidSendType());
        }
        else {
          console.log('Send type is valid: ' + validator.sendType);
          const sendDirections = new SendDirections();
          return new Promise(async () => {
            try {
              await sendDirections.sendDirections(validator.sendType, sessionAttributes.KELA_PHONE,
                sessionAttributes.KELA_EMAIL, directionURL);
              callback(null, response.returnDirectionsSent());
            } catch (err) {
              console.error(err);
              callback(null, response.returnDirectionsSentFailed());
            }
          });
        }
      }
    }).catch(err => {
      console.error(err);
      callback(null, response.returnDirectionsSentFailed());
    });
  }


  /**
   * 3. SCENARIO
   * ========================================================
   * 
   * User wants the directions to be sent via phone/email but
   * user hasn't logged in yet (by PIN). Pin will be asked from
   * the user.
   */
  else if (event.currentIntent.confirmationStatus === 'Confirmed' && !pinAlreadyValidated) {
    return response.returnElicitPin();
  }


  /**
   * 4. SCENARIO
   * ========================================================
   *
   * User has either provided the PIN for validation or has been already
   * logged in with PIN previously. If pin is OK, the send-type will
   * be asked next.
   */
  else if (slots.KELA_PIN ||
    (event.currentIntent.confirmationStatus === 'Confirmed' && pinAlreadyValidated)) {

    let pin: string;

    if (pinAlreadyValidated) {
      pin = sessionAttributes['KELA_PIN'];
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
   * 5. SCENARIO
   * ========================================================
   * 
   * This is the initialization which'll only send the message
   * of checking user's position (logic done in Sumerian) and 
   * also asking if user wants the directions to be sent.
   */
  else {
    return response.returnStartLocating();
  }
}
