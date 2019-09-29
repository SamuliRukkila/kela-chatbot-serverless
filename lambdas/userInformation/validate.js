/**
 * This object is purposed to validate every ascept of PIN.
 * 
 * TODO: Add validation for valid DATES
 */

const validate = {
  
  /**
   * Main function which validates PIN by calling other functions.
   * 
   * @param {String} pin PIN which will be validatet
   * @return validated PIN and variables which holds information if 
   * PIN is invalid
   */
  validatePin: pin => {

    pin = pin.replace(/ /g, '').toUpperCase();
    length = pin.length;

    console.log('Given unvalidated PIN: ' + pin);

    pin = validate.convertHyphon(pin);

    const invalidLength = validate.isPinLengthInvalid(pin.length);
    const invalidSymbol = validate.isCenturySymbolInvalid(pin);

    console.log('Validated PIN: ' + pin);

    return { pin, invalidLength, invalidSymbol };
  },


  /**
   * Converts hyphon (-) into a "-" -symbol. This symbol has 
   * many namings so all of the possible names are inside an array
   * which is then looped through to check if there's any matches.
   * 
   * @returns modified PIN
   */
  convertHyphon: pin => {
    const words = ['HYPHON', 'STREAK', 'SLASH', 'LINE', 'MINUS', 'DASH'];

    for (let i = 0; i < words.length; i++) {
      if (pin.includes(words[i])) pin = pin.replace(words[i], '-');
    }
    return pin;
  },


  /**
   * Checks that PIN's length is exactly 11 characters.
   * @param {Number} length PIN's length
   * @returns string if PIN is too long/short; null if valid
   */
  isPinLengthInvalid: length => {
    return length < 11 ? 'short' : length > 11 ? 'long' : null;
  },


  /**
   * Checks that PIN has valid century symbol.
   * Century symbol is 7th character in PIN.
   * Valid symbols are "-" -symbol (1900-1999) and A (2000 ->)
   * @param {String} pin PIN which'll be checked
   * @returns boolean value telling is century -symbol is valid
   */
  isCenturySymbolInvalid: pin => {
    const symbols = ["-", "A"];
    for (let i = 0; i < symbols.length; i++) {
      if (pin.slice(6, 7) === symbols[i]) {
        return false;
      }
    }
    return true;

  }
};

module.exports = validate;
