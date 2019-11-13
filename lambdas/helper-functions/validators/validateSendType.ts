
export class ValidateSendType {

  public sendType: string;
  public invalidSendType: boolean;
  public message: string;
  private _types: string[] = ['phone', 'email'];

  /**
   * Main function which'll call other private functions
   * to validate send-type.
   */
  public validateSendType(sendType: string): void {

    console.log('Validating send-type: ' + sendType);
    this.sendType = sendType;

    if (this.isSendTypeInvalid()) return;
  }


  /**
   * Private function which'll check that the provided 
   * send-type is one of the pre-determined reasons already.
   * 
   * @returns true if send-type is invalid, false if it's valid
   */
  private isSendTypeInvalid(): boolean {
    
    for (let i = 0; i < this._types.length; i++) {
      if (this.sendType.toLowerCase().includes(this._types[i])) {
        return false;
      }
    }
    console.error(`ERROR: Provided type isn't valid: ${this.sendType}`);
    this.invalidSendType = true;
    this.message = 'Provided type is not valid.';
    return true;
  }

}
