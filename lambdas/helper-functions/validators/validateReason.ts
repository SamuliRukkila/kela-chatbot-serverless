
export class ValidateReason {

  public reason: string;
  public invalidReason: boolean;
  public message: string;

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

    const reasons: string[] = [
      'Studies', 'Pension', 'Death of relative',
      'Housing benefits', 'Emigration or immigration',
      'Illness', 'Disability allowance or service', 
      'Military service', 'Rehabilitation', 'Income support',
      'Unemployment', 'Family with kids'
    ];

    for (let i = 0; i < reasons.length; i++) {
      if (this.reason.includes(reasons[i])) {
        return false;
      }
    }
    this.invalidReason = true;
    this.message = 'Provided reason is not valid.';
    return true;
  }
}

