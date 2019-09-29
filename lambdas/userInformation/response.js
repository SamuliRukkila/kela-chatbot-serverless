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
const response = {
  
  /**
   * Return empty response. Lex's bot will
   * continue according to it's configuration.
   */
  returnDelegate: () => {
    return {
      "dialogAction": {
        "type":  "Delegate"
      }
    };
  },

  /**
   * If PIN is invalid by it's length/value,
   * return an error message to Lex's bot telling
   * why it has failed.
   * 
   * @param {string} res.pin Validated PIN
   * @param {string} res.errorMessage Why PIN failed
   * 
   */
  returnInvalidPin: res => {
    return {
      "dialogAction": {
        "type": "ElicitSlot",
        "message": {
          "contentType": "PlainText",
          "content": `Your provided PIN: [${res.pin}] is invalid. 
            Reason: ${res.errorMessage}. Please try again.`
        },
        "intentName": "Kela_UserInformation",
        "slots": {
          "Kela_PIN": ""
        },
        "slotToElicit": "Kela_PIN"
      }
    };
  },

  returnConfirmPin: res => {

  }

  // returnPinConfirmation: res => {
  //   return {
  //     dialogAction: {
  //       type: 'Close',
  //       fulfillmentState: 'Fulfilled',
  //       message: {
  //         contentType: 'PlainText',
  //         content: res
  //       }
  //     }
  //   };
  // },

  // returnErrorAnswer: res => {
  //   return {
  //     dialogAction: {
  //       type: 'Close',
  //       fulfillmentState: 'Failed',
  //       message: {
  //         contentType: 'PlainText',
  //         content: res
  //       }
  //     }
  //   };
  // }
};

module.exports = response;
