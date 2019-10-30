
export class ValidateReason {

  public reason: string;
  public invalidReason: boolean;
  public message: string;

  private reasons: string[] = [
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

  public validateReason(reason: string): void {

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

    for (let i = 0; i < this.reasons.length; i++) {
      if (this.reason.toLowerCase().includes(this.reasons[i])) {
        return false;
      }
    }
    console.error(`ERROR: Provided reason isn't valid: ${this.reason}`);
    this.invalidReason = true;
    this.message = 'Provided reason is not valid.';
    return true;
  }
}

