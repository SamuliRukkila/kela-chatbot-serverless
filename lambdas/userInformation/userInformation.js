const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const validate = require('./validate');
const response = require('./response');

module.exports.handler = async event => {
  
  console.log(event);
  console.log(event.currentIntent);

  // If Lex is doing a validation call for the PIN
  if (event.invocationSource === 'DialogCodeHook' && event.currentIntent.slots.Kela_PIN) {
    
    const pin = validate.validatePin(event.currentIntent.slots.Kela_PIN);

    if (pin.invalidLength) {
      return response.returnInvalidPin({
        pin: pin.pin, errorMessage: `PIN is too ${pin.invalidLength}`
      });
    }
    
    if (pin.invalidSymbol) {
      return response.returnInvalidPin({
        pin: pin.pin, errorMessage: `Invalid century-symbol. Possible symbols (- & A)`
      });
    }

    return response.returnConfirmPin(pin.pin);
  }

  // If lex is doing initilization
  else if (event.invocationSource === 'DialogCodeHook') {
    return response.returnDelegate();
  }

  else {
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
