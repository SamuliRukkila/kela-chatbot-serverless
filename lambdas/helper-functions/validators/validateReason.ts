import { timingSafeEqual } from "crypto";

export class ValidateReasn {

  public reason: string;
  public invalidReason: boolean;
  public message: string;

  public validateReason(reason: string): void {

    this.reason = reason;

    if (this.isReasonInvalid()) return;

  }

  private isReasonInvalid(): boolean {
    
  }

}

