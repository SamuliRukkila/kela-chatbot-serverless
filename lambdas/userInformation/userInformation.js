const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const validate = require('./validate');
const response = require('./response');

module.exports.handler = async event => {
  
  console.log(event);
  console.log(event.currentIntent);

  // User PIN is confirmed and information will be searched 
  // according to that user by it's PIN from DynamoDB
  if (event.currentIntent.confirmationStatus === 'Confirmed' &&
    event.currentIntent.slots.Kela_PIN) {

    const res = searchUserByPin(event.currentIntent.slots.Kela_PIN);

      const pin = event.currentIntent.slots.Kela_PIN;
      
      if (err) {
        console.error(err);
        return response.returnFailedSearch(false);
      }
      if (!res) {
        console.error('Could not find user with PIN: ' + pin);
        return response.returnFailedSearch(true, pin);
      }
  
      return response.returnUserInformation(res.Item);

    });
  }

  // If Lex is doing a validation call for the PIN
  else if (event.invocationSource === 'DialogCodeHook' && event.currentIntent.slots.Kela_PIN) {
    
    // Validate PIN
    const res = validate.validatePin(event.currentIntent.slots.Kela_PIN);

    // PIN's length is too short/long
    if (res.invalidLength) {
      return response.returnInvalidPin({
        pin: res.pin, errorMessage: `PIN is too ${res.invalidLength}`
      });
    }
    
    // PIN's century -symbol is invalid
    if (res.invalidSymbol) {
      return response.returnInvalidPin({
        pin: res.pin, errorMessage: `Invalid century -symbol. Possible symbols (- & A)`
      });
    }

    // Pin is valid and user is required to confirm it
    return response.returnConfirmPin(res.pin);
  }

  // If lex is doing initilization
  else {
    return response.returnDelegate();
  }


};

async const searchUserByPin = (pin, callback) => {
  const params = {
    TableName: 'kela-Customers',
    Key: {
      Pin: pin
    }
  };

  ddb.get(params).promise()
    .then(res => callback(null, res))
    .catch(err => callback(err, null));
};
