const AWS = require('aws-sdk');
const SNS = new AWS.SNS();
const SES = new AWS.SES();

export class SendDirections {

  /**
   * Function which'll send directions to user via Phone SMS or
   * email. All the needed values come from parameters.
   */
  public async sendDirections(
    sendType: string, phone: string, email: string): Promise<null> {

    // Send directions to user via SMS
    if (sendType.toLowerCase().includes('phone')) {
      const params = {
        Message: `Hello, thank you for using Kela's chatbot. Here are your direction: `,
        PhoneNumber: phone
      };

      return await SNS.publish(params).promise();
    }
    // Send directions to user via EMAIL
    else {
      const params = {
        Destination: {
          ToAddresses: [ email ]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `<p>Hello, thank you for using Kela's Chatbot.</p>
                <p>Here are your directions: </p>
                <p>[DIRECTIONS]</p>`
            },
            Text: {
              Charset: 'UTF-8',
              Data: 'TEXT_FORMAT_BODY'
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Kela Chatbot: Your directions'
          }
        },
        Source: 'kela.chatbot@gmail.com'
      };

      return await SES.sendEmail(params).promise();
    }

  }

}