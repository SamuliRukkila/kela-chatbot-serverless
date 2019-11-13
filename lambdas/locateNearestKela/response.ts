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
   * Returns confirmation which'll tell Sumerian to start
   * searching for user in Sumerian UI. 
   */
  public returnStartLocating(): DialogDelegate {
    return {
      sessionAttributes: this.sessionAttributes,
      dialogAction: {
        type: 'Delegate',
        slots: this.slots
      }
    }
  }

};