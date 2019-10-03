/**
 * Informs Amazon Lex that the user is expected 
 * to give a yes or no answer to confirm or deny 
 * the current intent.
 * 
 * You must include the intentName and slots fields. 
 * The slots field must contain an entry for each of 
 * the filled slots for the specified intent. You don't 
 * need to include a entry in the slots field for slots 
 * that aren't filled. 
 * 
 * You must include the message field if the intent's 
 * confirmationPrompt field is null. The contents of 
 * the message field returned by the Lambda function take 
 * precedence over the confirmationPrompt specified in 
 * the intent. The responseCard field is optional.
 * 
 * @example fullfillmentState = "Fullfilled" / "Failed"
 * @example contentType = "PlainText" / "SSML" / "CustomPayload"
 */

export class DialogConfirmIntent {

  public sessionAttributes?: Object;
  public dialogAction: {
    type: 'ConfirmIntent';
    message?: {
      contentType: string,
      content: string;
    };
    intentName: string;
    slots: Object;
  }
}