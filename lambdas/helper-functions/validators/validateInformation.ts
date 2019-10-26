
export class ValidateInformation {

  public information: string;
  public invalidInformation: boolean;
  public message: string;

  public validateInformation(information: string): void {

    this.information = information;

    if (this.isInformationInvalid()) return;

  }

  private isInformationInvalid(): boolean {

  }

}
