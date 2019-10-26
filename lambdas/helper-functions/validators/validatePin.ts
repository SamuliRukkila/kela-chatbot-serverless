/**
 * This object is purposed to validate every ascept of PIN.
 * 
 * TODO: Add validation for valid DATES
 */

export class ValidatePin {

  public pin: string;
  public invalidPin: boolean;

  /**
   * Main function which validates PIN by calling other functions.
   * 
   * @param {string} Pin Given PIN which'll be validated and parsed
   * @return validated PIN and variables which holds information if 
   * PIN is invalid
   */
  public validatePin(pin: string): void {

    this.pin = pin;

    console.log('VALIDATEPIN: Unparsed string: ' + this.pin);
    
    this.parsePinFromString();

    console.log('VALIDATEPIN: Parsed PIN without validation: ' + this.pin);

    // Add validations here, for every method call, check if invalidPin 
    // -property is already true because in this case, PIN won't be accepted
    // no matter what.
    if (!this.invalidPin) {
      this.isCenturySymbolInvalid();
    }

    console.log('Validated PIN: ' + this.pin);
  }

  /**
   * Parses the potent PIN from the string which user mutterances
   * to the bot.
   */
  private parsePinFromString(): void {
    this.pin = this.pin.replace(/ /g, '').toUpperCase();
    this.convertHyphon();
    if (this.pin.length > 10) this.pin = this.pin.substr(this.pin.length - 11);
  }

  /**
   * Converts hyphon (-) into a "-" -symbol. This symbol has 
   * many namings so all of the possible names are inside an array
   * which is then looped through to check if there's any matches.
   */
  private convertHyphon(): void {
    const words = ['HYPHON', 'STREAK', 'SLASH', 'LINE', 'MINUS', 'DASH'];

    for (let i = 0; i < words.length; i++) {
      if (this.pin.includes(words[i])) {
        this.pin = this.pin.replace(words[i], '-');
      }
    }
  }


  /**
   * Checks that PIN has valid century symbol.
   * Century symbol is 7th character in PIN.
   * 
   * Valid symbols are "-" -symbol (1900-1999) and A (2000 ->).
   */
  private isCenturySymbolInvalid(): void {
    const symbols = ["-", "A"];
    for (let i = 0; i < symbols.length; i++) {
      if (this.pin.slice(6, 7) === symbols[i]) {
        return;
      }
    }
    this.invalidPin = true;
    console.error(
      `Provided PIN: [${this.pin}] is invalid. Reason: 
      PIN's 7th letter should contain either
      slash (-) or A character. Actual 
      character: [${this.pin.slice(6, 7)}]`
    ); 
  }
};

