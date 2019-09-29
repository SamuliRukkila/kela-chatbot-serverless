const validate = require('./validate');
const response = require('./response');
const dynamoDB = require('./dynamodb');

/**
 * Main function of user information -lambda. At this
 * moment only LEX will call this function. Function
 * will consist of three different scenarios which will
 * be distruped by conditional statement (if, else etc.).
 * 
 * @param {Object} event Contains events send by LEX's bot
 */
module.exports.handler = async event => {
  
  console.log(event);
  console.log(event.currentIntent);

  /**
   * 1. SCENARIO
   * 
   * User PIN is confirmed and information will be searched 
   * according to that user by it's PIN from DynamoDB
   */
  if (event.currentIntent.confirmationStatus === 'Confirmed' &&
    event.currentIntent.slots.Kela_PIN) {
      
    dynamoDB.searchUserByPin(event.currentIntent.slots.Kela_PIN, (err, res) => {
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

  /**
   * 2. SCENARIO
   * 
   * If Lex is doing a validation call for the PIN.
   * Validated PIN will be sent back to LEX in the end.
   */
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

  
  /**
   * 3. SCENARIO
   * 
   * This will (and should) only happen when Lex is doing
   * initialization call.
   */
  else {
    return response.returnDelegate();
  }


};
