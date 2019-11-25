/**
 * Returns a response to Lex. Responses are assigned
 * to various function. Lex requires precise JSON-format
 * for returns or it'll throw an error.
 *
 * @Author samulirukkila
 *
 * More info:
 * https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html?shortFooter=true#using-lambda-response-format
 *
 */

import { DialogClose } from '../../classes/DialogClose';
import { DialogDelegate } from '../../classes/DialogDelegate';
import { User } from '../../classes/User';
import { DialogConfirmIntent } from '../../classes/DialogConfirmIntent';
import { DialogElicitSlot } from '../../classes/DialogElicitSlot';

export class Response {
  /**
   * Return empty response. Lex's bot will continue
   * according to it's configuration.
   * 
   * @returns Empty response, which won't do anything
   */
  public returnDelegate(): DialogDelegate {
    return {
      dialogAction: {
        type: 'Delegate',
      }
    };
  }

  /**
   * If PIN is invalid by it's length/value,
   * return an error message to Lex's bot telling
   * why it has failed.
   *
   * @param {string} pin Invalid PIN
   */
  public returnInvalidPin(pin: string): DialogElicitSlot {
    return {
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Your provided PIN: [${pin}] is invalid. Please try again.`
        },
        intentName: 'Kela_UserInformation',
        slots: {
          KELA_PIN: null
        },
        slotToElicit: 'KELA_PIN'
      }
    };
  }


  /**
   * User has denied the provided and converted PIN. 
   * PIN will be asked again with confirmation.
   * 
   * @returns DialogEliciSlot -object which'll ask PIN again
   */
  public returnAskPinAgain(): DialogElicitSlot {
    return {
      sessionAttributes: null,
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Alright, lets try it again - what is your PIN?`
        },
        intentName: 'Kela_CheckAppointments',
        slots: {
          KELA_PIN: null
        },
        slotToElicit: 'KELA_PIN'
      }
    };
  }


  /**
   * PIN is valid and it'll be added to KELA_PIN -slot.
   * Confirmation will be sent to Lex's bot and if user
   * says "Yes". Data will be searched.
   *
   * @param {String} pin Validated PIN
   * @returns Validated & confirmed PIN
   */
  public returnConfirmPin(pin: string): DialogConfirmIntent {
    return {
      dialogAction: {
        type: 'ConfirmIntent',
        intentName: 'Kela_UserInformation',
        slots: {
          KELA_PIN: pin
        }
      }
    };
  }

  /**
   * If Lambda gets an error while searching for PIN from
   * DynamoDB or if the user is not found via it's PIN.
   * 
   * Error message will not be shown to the user.
   * 
   * @param {Boolean} unknownPin If user wasn't found from database
   * @param {string} pin User's provided PIN
   * @returns Error message why search failed and data to close current intent
   */
  public returnFailedSearch(unknownPin: boolean, pin: string): DialogClose {

    const content = unknownPin
      ? `Could not find user via provided PIN: ${pin}`
      : `Seems like there were an error while fetching 
          your data with provided PIN: ${pin}. My apologies.`;

    return {
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Failed',
        message: {
          contentType: 'PlainText',
          content: content
        }
      }
    };
  }

  /**
   * If user is found, return all of it's information back to the caller.
   * The current intent will be closed after this.
   * 
   * @param {any/string} res Response, which contains user's information
   * @returns User information and data to close current intent 
   */
  public returnUserInformation(res: any): DialogClose {

    const user: User = res;
    const content = "Here's your information. You can say \"Close info\" to close your information";

    return {
      sessionAttributes: {
        'KELA_FIRSTNAME': user.FirstName.S,
        'KELA_LASTNAME': user.LastName.S,
        'KELA_PIN': user.Pin.S,
        'KELA_DATE_OF_BIRTH': user.DateOfBirth.S,
        'KELA_CITY': user.City.S
      },
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Fulfilled',
        message: {
          contentType: 'PlainText',
          content: content
        }
      }
    };
  }

};