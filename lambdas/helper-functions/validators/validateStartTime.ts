import { Moment } from "moment";
import { DynamoDB } from '../database/dynamodb';

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

  private _hours: number;
  private _minutes: number;
  private _length: number;
  private _date: string;
  private _type: string;

  /**
   * Main function which'll use other private-functions to
   * validate the start-time for the appointment.
   *  
   * @param {string} startTime Start-time for the appointment 
   * @param {number} appointmentLength The length of the appointment which'll
   *  be used to validate start-time (this function is already validated in 
   *  previous functions)
   * @param {string} date The date of the appointment which'll be used
   *  to get that day's appointments to functions (with this one can check 
   *  if specific time -appointments are already taken)
   * @param {string} type The type of the appointment (phone / office -meeting)
   */
  public validateStartTime(startTime: string, length: number, date: string, type: string): void {
    
    console.log('Validating time' + startTime);
    
    if (moment(this.time).isValid()) {
      
      this.time = startTime;
      this.dateTime = moment(startTime, 'HH:mm').tz('Europe/Helsinki');
      
      this._hours = this.dateTime.hours();
      this._minutes = this.dateTime.minutes();

      this._length = length;
      this._date = date;
      this._type = type;
      
      /* If any of the function -calls will return
         true, validation will be stopped */
      if (this.isTimeTooEarly()) return;
      if (this.isTimeTooLate()) return;
      if (this.isTimeTaken()) return;

    } 
    else {
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

    if (this._hours < 8) {
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

    if (this._hours > 15 || (this._hours === 15 && this._minutes > 30)) {
      console.error('Error: Provided time is later than 15:30');
      this.invalidTime = true;
      this.message = 'Please provide a time at 15:30 or before that.';
      return true;
    }
    return false;
  }


  /**
   * 
   */
  private async isTimeTaken() {

    const dynamoDB = new DynamoDB();

    console.log(this._date);

    return await dynamoDB.checkAppointmentsForDate(this._date)
      .then(res => {
        if (!res.Item) {
          console.log('No appointments found for date:' + this._date);
          return false;
        }
        console.log(res.Item);
        return false;
      })
      .catch(err => {
        console.error(err);
        this.invalidTime = true;
        this.message = `There were an error while searching for other appointments.`;
        return true;
      });
  }



}

