const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const validate = require('./validate');
const response = require('./response');

module.exports.handler = event => {
  
  console.log(event);
  console.log(event.currentIntent);

  // If Lex is doing a validation call for the PIN
  if (event.invocationSource === 'DialogCodeHook' &&
    event.currentIntent.slots.Pin) {
    console.log('In 1. option');
    const pin = validate.validatePin(event.currentIntent.slots.Pin);

    if (pin.status === 'long' || pin.status === 'short') {
      return response.returnErrorAnswer(
        `Your given PIN: ${pin.pin} is too ${pin.status}`
      );
    } else {
      return response.returnValidAnswer(pin.pin);
    }
  } 
  else if (event.invocationSource === 'DialogCodeHook') {
    console.log('In 2. option');
    return response.returnAnswer('Delegate');
  }
  else {
    console.log('In 3. option');
    // get
  }

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
