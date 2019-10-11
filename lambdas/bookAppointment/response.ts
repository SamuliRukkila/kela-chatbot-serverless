import { DialogClose } from '../../classes/DialogClose';
import { DialogDelegate } from '../../classes/DialogDelegate';
import { User } from '../../classes/User';
import { DialogConfirmIntent } from '../../classes/DialogConfirmIntent';
import { DialogElicitSlot } from '../../classes/DialogElicitSlot';
import DynamoDB = require('aws-sdk/clients/dynamodb');

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
        intentName: 'Kela_BookAppointment',
        slots: {
          Kela_PIN: null
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
        intentName: 'Kela_BookAppointment',
        slots: {
          Kela_PIN: null
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
        intentName: 'Kela_BookAppointment',
        slots: {
          Kela_PIN: null
        },
        slotToElicit: 'KELA_PIN'
      }
    };
  }


  public returnPinSuccess(item: any): DialogDelegate {
    const user: User = item;
    return {
      sessionAttributes: {
        'KELA_FIRSTNAME': user.FirstName,
        'KELA_LASTNAME': user.LastName,
        'KELA_PIN': user.Pin
      },
      dialogAction: {
        type: 'Delegate'
      }
    }
  }
}

