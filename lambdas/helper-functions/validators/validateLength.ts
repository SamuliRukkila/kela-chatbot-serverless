
const moment = require('moment');

/**
 * Validation class which'll completely validate
 * the length of the meeting.
 */
export class ValidateLength {

  public length: number;
  public invalidLength: boolean;
  public message: string;

  /**
   * Main function which will call other private-functions
   * to validate the length
   * 
   * @param {string} length Length which'll be validated 
   */
  public validateLength(length: string): void {

    if (!this.isLengthNumber(length)) return;
    if (!this.isValidLength) return;
  }

  /**
   * Checks that provided number can be converted
   * into an actual number.
   * 
   * @param {string} length Length as a string
   * @returns true if value is number | false if isn't 
   */
  private isLengthNumber(length: string): boolean {
    console.log("NO NÄIN");
    if (Number(length) !== NaN) {
      this.length = Number(length);
      return true;
    } else {
      this.invalidLength = true;
      this.message = 'Length you provided isn\'t number.'
      return false; 
    }
  }

  /**
   * Checks that provided number is one of predetermined 
   * length -values.
   * 
   * @returns true if valid length -number | false if isn't
   */
  private isValidLength(): boolean {
    const validLengths: number[] = [15, 30, 45, 60];
    for (let i = 0; i < validLengths.length; i++) {
      if (this.length === validLengths[i]) {
        return true;
      }
    }
    this.invalidLength = true;
    this.message = 'Provided length isn\'t valid. Possible times are [15, 30, 45 & 60] minutes';
    return false;
  }

};

