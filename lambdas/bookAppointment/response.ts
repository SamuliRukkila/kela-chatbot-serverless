import { DialogClose } from '../../classes/DialogClose';
import { DialogDelegate } from '../../classes/DialogDelegate';
import { User } from '../../classes/User';
import { DialogConfirmIntent } from '../../classes/DialogConfirmIntent';
import { DialogElicitSlot } from '../../classes/DialogElicitSlot';
import DynamoDB = require('aws-sdk/clients/dynamodb');

export class Response {
  
  public sessionAttributes: Object;
  public slots: Object;

  /**
   * Return empty response. Lex's bot will continue
   * according to it's configuration.
   * 
   * @returns Empty response, which won't do anything
   */
  public returnDelegate(): DialogDelegate {


    return {
      sessionAttributes: this.sessionAttributes,
      dialogAction: {
        type: 'Delegate',
        slots: this.slots
      }
    };
  }


  /**
   * If PIN is invalid by it's length/value,
   * return an error message to Lex's bot telling
   * why it has failed.
   *
   * @param {string} pin Invalid PIN
   * @returns Error message that the provided PIN is invalid
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
        intentName: 'Kela_BookAppointment',
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
        intentName: 'Kela_BookAppointment',
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
        'KELA_FIRSTNAME': user.FirstName,
        'KELA_LASTNAME': user.LastName,
        'KELA_PIN_OK': true
      },
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `Hello, ${user.FirstName}. What day would you 
            like to book the appointment?`
        },
        intentName: 'Kela_BookAppointment',
        slots: {
          'KELA_PIN': user.Pin
        },
        slotToElicit: 'KELA_DATE'
      }
    }
  }


  /**
   * Provided value for the slot is invalid. This is 
   * generic function which'll work with every slot 
   * (excluding PIN). Lex is informed to ask for
   * the slot value again.
   * 
   * @param {string} slot Slot which'll be asked again
   * @param {string} message Error message on why the slot failed
   * @returns error message telling why the slot was invalid
   */
  public returnInvalidSlot(slot: string, message: string): DialogElicitSlot {

    // Older slots + session-attributes needs to be included or they'll disappear
    this.slots[slot] = null;

    return {
      sessionAttributes: this.sessionAttributes,
      dialogAction: {
        type: 'ElicitSlot',
        message: {
          contentType: 'PlainText',
          content: `I'm sorry. ${message} Please try again.`
        },
        intentName: 'Kela_BookAppointment',
        slots: this.slots,
        slotToElicit: slot
      }
    };
  }


  /**
   * Provided value for the slot is valid and will 
   * be saved. OK-mark will included in the session-attributes
   * so further lambda-requests know easily which slots are valid.
   * Lex is informed to continue to next course of action.
   * 
   * @param {slot} slot Slot which'll be saved 
   * @param {string | number} value Valid data for the slot
   * @returns information to tell for Lex to continue
   */
  public returnValidSlot(slot: string, value: string | number): DialogDelegate {

    // Older slots + session-attributes needs to be included or they'll disappear
    this.sessionAttributes[slot + "_OK"] = true;
    this.slots[slot] = value;

    return {
      sessionAttributes: this.sessionAttributes,
      dialogAction: {
        type: 'Delegate',
        slots: this.slots    
      }
    }
  }
}
