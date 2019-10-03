/**
 * Informs Amazon Lex that the user is expected to respond 
 * with an utterance that includes an intent. For example, 
 * "I want a large pizza," which indicates the OrderPizzaIntent. 
 * 
 * The utterance "large," on the other hand, is not sufficient 
 * for Amazon Lex to infer the user's intent.
 * 
 * The message and responseCard fields are optional. If you 
 * don't provide a message, Amazon Lex uses one of the bot's 
 * clarification prompts.
 * 
 * @example fullfillmentState = "Fullfilled" / "Failed"
 * @example contentType = "PlainText" / "SSML" / "CustomPayload"
 */

export class DialogElicitIntent {

  public sessionAttributes?: Object;
  public dialogAction: {
    type: 'ElicitIntent';
    message?: {
      contentType: string,
      content: string;
    };
  }

}