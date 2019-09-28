const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const validate = require('./validate');
const response = require('./response');

module.exports.handler = event => {
  console.log(event);

  if (event.invocationSource === 'DialogCodeHook' &&
    event.currentIntent.slots.Pin) {
    const pin = validate.validatePin(event.currentIntent.slots.Pin);

    if (pin.status === 'long' || pin.status === 'short') {
      return response.returnErrorAnswer(
        `Your given PIN: ${pin.pin} is too ${pin.status}`
      );
    } else {
      return response.returnValidAnswer(pin.pin);
    }
  }

  // getUserCredentials(event, (err, user) => {

  // });
};

const getUserCredentials = (user, callback) => {
  const params = {
    TableName: 'KelaCustomersTable',
    Key: {
      id: 1
    }
  };

  ddb
    .get(params).promise()
    .then(res => {
      console.log(res);
      callback(null, res);
    })
    .catch(err => {
      console.log(err);
      callback(err, null);
    });
};
