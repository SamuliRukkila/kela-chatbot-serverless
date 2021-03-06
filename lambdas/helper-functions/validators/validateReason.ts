
export class ValidateReason {

  public reason: string;
  public invalidReason: boolean;
  public message: string;
  private _reasons: string[] = [
    'studies',
    'pension',
    'death of relative',
    'housing benefits',
    'emigration or immigration',
    'illness',
    'disability allowance or service',
    'military service',
    'rehabilitation',
    'income support',
    'unemployment',
    'family with kids'
  ];


  /**
   * Main function which'll call other private functions
   * to validate send-type.
   */
  public validateReason(reason: string): void {

    console.log('Validating reason: ' + reason);    
    this.reason = reason;

    if (this.isReasonInvalid()) return;

  }

  /**
   * Private function which'll check that the provided
   * reason is one of the pre-determinated reasons already.
   * 
   * @returns true if reason isn't valid, false if it's valid
   */
  private isReasonInvalid(): boolean {

    for (let i = 0; i < this._reasons.length; i++) {
      if (this.reason.toLowerCase().includes(this._reasons[i])) {
        return false;
      }
    }
    console.error(`ERROR: Provided reason isn't valid: ${this.reason}`);
    this.invalidReason = true;
    this.message = 'Provided reason is not valid.';
    return true;
  }
}

