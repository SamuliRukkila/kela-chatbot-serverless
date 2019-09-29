const response = {
  
  returnAnswer: res => {
    return {
      dialogAction: {
        type: res,
        fulfillmentState: 'Fulfilled',
        message: {
          contentType: 'PlainText',
        }An error has occurred: Invalid Lambda Response: Received null response from Lambda
      }
    };
  },

  // returnNotFoundAnswer: res => {
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
