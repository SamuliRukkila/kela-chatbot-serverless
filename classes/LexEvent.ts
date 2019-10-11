/**
 * The following shows the general format of an Amazon Lex event 
 * that is passed to a Lambda function. Use this information when 
 * you are writing your Lambda function.
 * 
 * More info:
 * https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html?shortFooter=true#using-lambda-input-event-format
 * 
 */

export class LexEvent {

  public currentIntent: {
    name: string;
    slots?: any;
    slotDetails?: any;
    confirmationStatus: string;
  };
  public bot: {
    name: string;
    alias: string;
    version: string;
  };
  public userId: string;
  public inputTranscript: string;
  public invocationSource: string;
  public outputDialogMode: string;
  public messageVersion: string;
  public sessionAttributes?: Object;
  public requestAttributes?: Object;
  public recentIntentSummaryView?: [{
    intentName?: string;
    checkpointLabel?: string;
    slots?: Object[];
    confirmationStatus?: string;
    dialogActionType?: string;
    fulfillmentState?: string;
    slotToElicit?: string;
  }];
};