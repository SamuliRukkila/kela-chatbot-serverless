

/**
 * Validation class which'll completely validate
 * the length of the meeting.
 */
export class ValidateLength {

  public length: number;
  public invalidLength: boolean;
  public message: string;
  private isMinutes: boolean;

  /**
   * Main function which will call other private-functions
   * to validate the length
   * 
   * @param {string} length Length which'll be validated 
   */
  public validateLength(length: string): void {

    console.log('Validating length: ' + length)

    if (!this.isLengthNumber(length)) return;
    if (!this.isValidLength()) return;
  }

  /**
   * Checks that provided number can be converted
   * into an actual number.
   * 
   * @param {string} length Length as a string
   * @returns true if value is number | false if isn't 
   */
  private isLengthNumber(length: string): boolean {
    
    // If user didn't give time as hours (PT15/30/45M)
    // Example prompt "1 hour"
    if (!length.includes('H')) this.isMinutes = true;
    
    if (length.match(/\d+/g)) {
      this.length = Number(length.match(/\d+/g)[0]);
      return true;
    }
    else {
      console.error('ERROR: Provided length isn\'t convertable to number: ' + length)
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

    const validLengths: number[] = [15, 30, 45, 60];

    // If user provided length in hours instead of minutes
    if (this.length === 1 && !this.isMinutes) this.length = 60;

    for (let i = 0; i < validLengths.length; i++) {
      if (this.length === validLengths[i]) {
        return true;
      } 
    }
    console.error(`ERROR: Provided length: ${this.length} isn't right value: [15, 30, 45, 60]`);
    this.invalidLength = true;
    this.message = 'Provided length isn\'t valid. Possible times are [15, 30, 45 & 60] minutes.';
    return false;
  }

};

