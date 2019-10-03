/**
 * Informs Amazon Lex that the user is expected to 
 * provide a slot value in the response.
 * 
 * The intentName, slotToElicit, and slots fields 
 * are required. The message and responseCard fields 
 * are optional. If you don't specify a message, 
 * Amazon Lex uses one of the slot elicitation prompts 
 * configured for the slot.
 * 
 * @example fullfillmentState = "Fullfilled" / "Failed"
 * @example contentType = "PlainText" / "SSML" / "CustomPayload"
 */

export class DialogElicitSlot {

  public sessionAttributes?: Object;
  public dialogAction: {
    type: 'ElicitSlot';
    message?: {
      contentType: string,
      content: string;
    };
    intentName: string;
    slots: Object;
    slotToElicit: string;
  }

}