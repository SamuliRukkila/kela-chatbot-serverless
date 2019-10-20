import { Moment } from "moment";
const moment = require('moment-timezone');

/**
 * This object is purposed to validate every ascept of PIN.
 * 
 * TODO: Add validation for valid DATES
 */

export class ValidateStartTime {

  public time: string;
  public dateTime: Moment;
  public invalidTime: boolean;
  public message: string;

  private hours: number;
  private minutes: number;
  private appointmentLength: number;

  /**
   * Main function which'll use other private-functions to
   * validate the start-time for the appointment.
   *  
   * @param {string} startTime Start-time for the appointment 
   * @param {number} appointmentLength The length of the appointment which'll
   *  be used to validate start-time (this function is already validated in 
   *  previous functions) 
   */
  public validateStartTime(startTime: string, appointmentLength: number): void {
    
    this.appointmentLength = appointmentLength;
    this.dateTime = moment(startTime, 'HH:mm').tz('Europe/Helsinki');
    this.hours = this.dateTime.hours();
    this.minutes = this.dateTime.minutes();
    this.time = startTime;

    console.log('Validating time' + startTime);

    /* If any of the function -calls will return
       true, validation will be stopped */
    if (moment(this.time).isValid()) {
      if (this.isTimeTooEarly()) return;
      if (this.isTimeTooLate()) return;
    } else {
      this.invalidTime = true;
      this.message = 'Provided time is invalid.'
    }
  }
  
  /**
   * Private function which'll check that the wanted
   * time for the meeting is at 08:00 or later.
   * 
   * @returns true if time is before 8:00, false if time is before that 
   */
  private isTimeTooEarly(): boolean {

    console.log(`Checking that time isn't too 
      early (lower than 08:00): ${this.time}`);

    if (this.hours < 8) {
      console.error('Error: Provided time is earlier than 08:00');
      this.invalidTime = true;
      this.message = 'Please provide a time at 08:00 or after.';
      return true;
    }
    return false;
  }


  /**
   * Private function which'll check that the wanted time
   * for the meeting is 15:30 or before.
   * 
   * @returns true if time is after 15:30, false if time is before that
   */
  private isTimeTooLate(): boolean {

    console.log(`Checking that time isn't too 
      late (higher than 15:30): ${this.time}`);

    if (this.hours > 15 || (this.hours === 15 && this.minutes > 30)) {
      console.error('Error: Provided time is later than 15:30');
      this.invalidTime = true;
      this.message = 'Please provide a time at 15:30 or before that.';
      return true;
    }
    return false;
  }


}

