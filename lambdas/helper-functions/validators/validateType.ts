
export class ValidateType {

  public type: string;
  public invalidType: boolean;
  public message: string;
  public length: number;

  /**
   * Main function which'll validate the pasted
   * type. Type is already restricted heavily on Lex's
   * side to two possible values. 
   * 
   * Appointment's length is distruped automatically 
   * by the type.
   * 
   * @param {string} type The type of the meeting (Office/Phone)
   */
  public validateType(type: string): void {

    this.type = type;
    if (this.typeIsValid()) this.addLengthByType();
  }


  /**
   * Private function which'll verify that provided appointment-type
   * is one of the two (already defined) types.
   * 
   * @returns true if type is valid, false if type is invalid
   */
  private typeIsValid(): boolean {

    if (this.type.includes('office')) {
      this.type = 'office';
      return true;
    }
    else if (this.type.includes('phone')) {
      this.type = 'phone';
      return true;
    }
    else {
      this.invalidType = true;
      this.message = `Your provided meeting type is incorrect. 
        Possible types are "Office" and "Phone".`
      return false;
    }

  }


  /**
   * Private function which'll determine the length of
   * the appointment by the type. These lengths are fetched
   * from the official KELA site.
   */
  private addLengthByType(): void {
    this.length = this.type === 'office' ? 45 : 30;
  }

}

