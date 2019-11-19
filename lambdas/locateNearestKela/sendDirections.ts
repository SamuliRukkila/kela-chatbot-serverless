const AWS = require('aws-sdk');
const SNS = new AWS.SNS();
const SES = new AWS.SES();

export class SendDirections {

  /**
   * Function which'll send directions to user via Phone SMS or
   * email. All the needed values come from parameters.
   * 
   * @param {string} sendType Type in which the directions are sent (phone/email)
   * @param {string} phone Phonenumber if directions are sent via SMS
   * @param {string} email Email-address if directions are sent via email
   * @param {string} url The url which contains the directions specified in Sumerian
   * 
   * @returns Empty promise (we won't need any data expect if there's an error)  
   */
  public async sendDirections(
    sendType: string, phone: string, email: string, url: string): Promise<null> {

    // Send directions to user via SMS
    if (sendType.toLowerCase().includes('phone')) {
      const params = {
        Message: `Hello, thank you for using Kela's chatbot. Here are your directions: ${url}`,
        PhoneNumber: phone
      };

      return await SNS.publish(params).promise();
    }

    // Send directions to user via EMAIL
    else {
      const params = {
        Destination: {
          ToAddresses: [email]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `<p>Hello, thank you for using Kela's Chatbot.</p>
                <p>Here are your directions: </p>
                <a href="${url}" target="_blank">Directions</a>`
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