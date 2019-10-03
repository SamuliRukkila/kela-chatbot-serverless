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
   */
  public returnDelegate (): DialogDelegate {
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
   * @param {string} res.pin Validated PIN
   * @param {string} res.errorMessage Why PIN failed
   *
   */
  public returnInvalidPin(res: any): DialogElicitSlot {
    return {
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Your provided PIN: [${res.pin}] is invalid. 
            Reason: ${res.errorMessage}. Please try again.`
        },
        intentName: 'Kela_UserInformation',
        slots: {
          Kela_PIN: ''
        },
        slotToElicit: 'Kela_PIN'
      }
    };
  }

  /**
   * PIN is valid and it'll be added to Kela_PIN -slot.
   * Confirmation will be sent to Lex's bot and if user
   * says "Yes". Data will be searched.
   *
   * @param {String} pin Validated PIN
   */
  public returnConfirmPin(pin: string): DialogConfirmIntent {
    return {
      dialogAction: {
        type: 'ConfirmIntent',
        intentName: 'Kela_UserInformation',
        slots: {
          Kela_PIN: pin
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
   */
  public returnFailedSearch (unknownPin: boolean, pin = null): DialogClose {

    const content = unknownPin
      ? `Could not find user via provided PIN: ${pin}`
      : 'Seems like there were an error while fetching your data. My apologies.';  

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

  public returnUserInformation (user: User): DialogClose {

    return {
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Fulfilled',
        message: {
          contentType: 'PlainText',
          content: user.toString()
        }
      }
    };
  }

};