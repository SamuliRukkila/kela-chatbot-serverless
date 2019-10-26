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
import { Appointment } from '../../classes/Appointment';
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
        intentName: 'Kela_CheckAppointments',
        slots: {
          Kela_PIN: null
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
   * @returns Validated & confirmed PIN
   */
  public returnConfirmPin(pin: string): DialogConfirmIntent {
    return {
      dialogAction: {
        type: 'ConfirmIntent',
        intentName: 'Kela_CheckAppointments',
        slots: {
          Kela_PIN: pin
        }
      }
    };
  }


  /**
   * If Lambda gets an error while searching for PIN from
   * DynamoDB or if the appointments are not found via user's PIN.
   * 
   * Error message will not be shown to the user.
   * 
   * @param {Boolean} unknownPin If appointments were found from database
   * @param {string} pin User's provided PIN
   * @returns Error message why search failed and data to close current intent
   */
  public returnFailedSearch(unknownPin: boolean, pin: string): DialogClose {

    const content = unknownPin
      ? `You don't have any appointments via provided PIN: ${pin}`
      : `Seems like there was an error while fetching your appointments`;

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
   * If at least one appointment is found for the user, return data back to the caller.
   * The current intent will be closed after this.
   * 
   * @param {any} res Response, which contains user's appointments
   * @returns Appointments and data to close current intent 
   */
  public returnAppointments(res: any): DialogClose {

    const appointments = res;
    const content = `Here are your appointments. You can say "Close appointments" to close your appointments view`;

    console.log("Appointments:");
    console.log(appointments);

    return {
      sessionAttributes: appointments,
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