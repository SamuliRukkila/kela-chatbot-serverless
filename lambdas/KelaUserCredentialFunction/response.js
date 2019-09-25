const response = {
  returnValidAnswer: res => {
    return {
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Fulfilled',
        message: {
          contentType: 'PlainText',
          content: res
        }
      }
    };
  },

  returnNotFoundAnswer: res => {},

  returnErrorAnswer: res => {
    return {
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Failed',
        message: {
          contentType: 'PlainText',
          content: res
        }
      }
    };
  }
};

module.exports = response;
