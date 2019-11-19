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
import { DialogConfirmIntent } from '../../classes/DialogConfirmIntent';
import { DialogElicitSlot } from '../../classes/DialogElicitSlot';
import { User } from '../../classes/User';

export class Response {

  public sessionAttributes: object;
  public slots: object;

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
   * User wants the directions to be sent to him/her. Before
   * that we'll need their PIN in order to know where the 
   * directions will be sent. 
   * 
   * @returns DialogElicitSlot -object telling user that we'll
   * need their PIN
   */
  public returnElicitPin(): DialogElicitSlot {
    return {
      sessionAttributes: this.sessionAttributes,
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `In order to send the directions for you I'll need your
            personal identification number. Could you provide it to me?`
        },
        intentName: 'Kela_LocateNearestKela',
        slots: this.slots,
        slotToElicit: 'KELA_PIN'
      }
    }
  }



  /**
   * Returns confirmation which'll tell Sumerian to start
   * searching for user in Sumerian UI via coordinates.
   * 
   * @returns ConfirmIntent -object, because we need to know
   * if user wants the directions to be sent to him/her
   */
  public returnStartLocating(): DialogConfirmIntent {

    this.sessionAttributes['KELA_SEND_URL'] = true;

    return {
      sessionAttributes: this.sessionAttributes,
      dialogAction: {
        type: 'ConfirmIntent',
        message: {
          contentType: 'PlainText',
          content: `Searching for your location now.. Would you like me to send
          this waypoint for you?`
        },
        intentName: 'Kela_LocateNearestKela',
        slots: this.slots
      }
    }
  }

  /**
   * Returns an eror telling that the provided PIN were invalid. User
   * needs to re-enter their PIN.
   * 
   * @returns DialogElicitSlot, to elicit PIN-slot again
   */
  public returnInvalidPin(pin: string): DialogElicitSlot {
    return {
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Your provided PIN: [${pin}] is invalid. Please try again.`
        },
        intentName: 'Kela_LocateNearestKela',
        slots: {
          KELA_PIN: null
        },
        slotToElicit: 'KELA_PIN'
      }
    };
  }

  /**
 * If lambda cannot find the user via provided PIN from 
 * DynamoDB-database.
 * 
 * @param {string} pin User's provided PIN
 * @returns Error message why search failed and data to close current intent
 */
  public returnNotFoundPin(pin: string): DialogElicitSlot {
    return {
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Sorry, I couldn't find you with your 
            provided PIN: [${pin}]. Please try again.`
        },
        intentName: 'Kela_LocateNearestKela',
        slots: {
          KELA_PIN: null
        },
        slotToElicit: 'KELA_PIN'
      }
    };
  }


  /**
   * If there was an error while searching user from DynamoDB-database
   * via provided PIN.
   * 
   * @param {string} pin User's provided PIN
   * @returns Error message why search failed and data to close current intent
   */
  public returnPinError(pin: string): DialogElicitSlot {
    return {
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Seems like there were an error while fetching 
            your data with provided PIN: ${pin}. My apologies.`
        },
        intentName: 'Kela_LocateNearestKela',
        slots: {
          KELA_PIN: null
        },
        slotToElicit: 'KELA_PIN'
      }
    };
  }


  /**
   * If PIN was valid and user was found with it. OK -mark
   * and full name will be saved into session-attributes.
   * Lex is informed to continue to appointment slots (KELA_DATE 
   * at this moment).
   * 
   * @param {any | User} item Item which'll include user's information 
   * @returns specified session-attributes + information to tell Lex to continue
   */
  public returnPinSuccess(item: any): DialogElicitSlot {

    const user: User = item;

    return {
      sessionAttributes: {
        'KELA_FIRSTNAME': user.FirstName.S,
        'KELA_PHONE': user.Phone.S,
        'KELA_EMAIL': user.Email.S,
        'KELA_PIN': this.slots['KELA_PIN'],
        'KELA_PIN_OK': true
      },
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Okay ${user.FirstName.S}, and would you like the directions
            be sent to your phone or email?`
        },
        intentName: 'Kela_LocateNearestKela',
        slots: {
          'KELA_PIN': user.Pin.S
        },
        slotToElicit: 'KELA_SEND_TYPE'
      }
    }
  }


  /**
   * User mutterance wasn't recognised as a "phone" or "email" so 
   * elicit -request will be sent back to ask user to say it again.
   * 
   * @returns ElicitSlot -object to ask for send-type again 
   */
  public returnInvalidSendType(): DialogElicitSlot {
    this.slots['KELA_SEND_TYPE'] = null;
    return {
      sessionAttributes: this.sessionAttributes,
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Sorry, I didn't understant. Please say "phone" or "email`
        },
        intentName: 'Kela_LocateNearestKela',
        slots: this.slots,
        slotToElicit: 'KELA_SEND_TYPE'
      }
    }
  }

  /**
   * Returns a message which tells that directions were send to the user.
   * Dialog is complete now.
   * 
   * @returns DialogClose -object which will end current conversation as a success
   */
  public returnDirectionsSent(): DialogClose {
    return {
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Fulfilled',
        message: {
          contentType: 'PlainText',
          content: 'Directions has been sent to you. Thank you!'
        }
      }
    }
  }

  /**
   * Returns a message which tells that lambda were unable to send 
   * the directions for the user. Dialog is failed, but completed.
   * 
   * @returns DialogClose -object, telling that sending directions has failed.
   */
  public returnDirectionsSentFailed(): DialogClose {
    return {
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Failed',
        message: {
          contentType: 'PlainText',
          content: `Unfortunately I couldn't send the directions for you. My bad!`
        }
      }
    }
  }

};