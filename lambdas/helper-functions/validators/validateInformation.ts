
export class ValidateInformation {

  public information: string;
  public invalidInformation: boolean;
  public message: string;

  public validateInformation(information: string): void {

    this.information = information;

    if (this.isInformationTooShort()) return;
    if (this.isInformationTooLong()) return;
  }

  /**
   * Check's that the information is atleast 
   * 25 characters long.
   * 
   * @returns true if information is too short, false if it long enough
   */
  private isInformationTooShort(): boolean {
    if (this.information.length < 25) {
      this.message = 'Your provided informatio is too short. Include atleast 25 characters.';
      this.invalidInformation = true;
      return true;
    }
    return false;
  }


  private isInformationTooLong(): boolean {
    if (this.information.length > 1000) {
      this.message = 'Your provided informatio is too long. Include at maximum 1000 characters.';
      this.invalidInformation = true;
      return true;
    }
    return false;
  }
}
