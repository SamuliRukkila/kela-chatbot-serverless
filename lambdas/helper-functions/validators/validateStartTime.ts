import { Moment } from "moment";
import { DynamoDB } from '../database/dynamodb';

const moment = require('moment-timezone');

/**
 * This class will completely validate appointment's start-time.
 * It'll also check if there's reserved appointments already
 * in place in the time user wants the appointment.
 * 
 * Appointment-types won't overlap each other, so other user 
 * can have, for example, phone-appointment at 08:00-08:30, and 
 * another one have an office-appointment at 08:00-08:45.
 * 
 * Appointments are in two types: phone & office:
 * 
 *  Phone -meetings are 30 minutes long and times are available  
 *  every half hour:
 *  @Example 08:00-08:30 | 08:30-09:00 | ... | 15:30-16:00
 * 
 *  Office -meetings are 45 minutes long and times are available
 *  for appointments for every hour:
 *  @Example 08:00-08:45 | 09:00-09:45 | ... | 15:00-15:45
 * 
 */
export class ValidateStartTime {

  public time: string;
  public dateTime: Moment;
  public invalidTime: boolean;
  public message: string;

  private _hours: number;
  private _minutes: number;
  private _date: string;
  private _type: string;

  /**
   * Main function which'll use other private-functions to
   * validate the start-time for the appointment.
   *  
   * @param {string} startTime Start-time for the appointment 
   * @param {string} date The date of the appointment which'll be used
   *  to get that day's appointments to functions (with this one can check 
   *  if specific time -appointments are already taken)
   * @param {string} type The type of the appointment (phone / office -meeting)
   */
  public validateStartTime(startTime: string, date: string, type: string): void {

    console.log('Validating time: ' + startTime);

    if (moment(startTime, 'HH:mm').isValid()) {

      this.time = startTime;
      this.dateTime = moment(date + startTime, 'YYYY-MM-DD HH:mm');
      
      this._hours = this.dateTime.hours();
      this._minutes = this.dateTime.minutes();
      
      this._date = date;
      this._type = type;

      /* If any of the function -calls will return
         true, validation will be stopped */
      if (this.isTimeTooEarly()) return;
      if (this.isTimeTooLate()) return;
      if (this.isTimeInvalid()) return;
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

    // Office -appointments
    if (this._type === 'office' && this._hours > 15) {

      console.error(`Error: Provided time for office -appointment is later than 15:00: ${this.time}`);
      this.invalidTime = true;
      this.message = 'Latest time for the office -appointment is 15:00';
      return true;
    }

    // Phone -appointments
    else if (this._type === 'phone' && 
      (this._hours > 15 || (this._hours === 15 && this._minutes > 30))) {

      console.error(`Error: Provided time for phone -appointment is later than 15:30: ${this.time}`);
      this.invalidTime = true;
      this.message = 'Latest time for the phone -appointment is 15:30.';
      return true;
    }
    return false;
  }

  
  /**
   * Private function which'll check that the provided time
   * is valid via validating minutes provided. 
   * 
   * Office -appointments can start hourly (08:00, 09:00 -> 15:00).
   * Phone -appointments can start every half hour (08:30, 08:30, 09:00 -> 15:30).
   * 
   * @returns True if time is valid, false if it isn't
   */
  private isTimeInvalid(): boolean {

    console.log(`Checking that the ${this._type} 
      -appointment's minutes is right:' + ${this._minutes} minutes`);

    // Office -appointments
    if (this._type === 'office' && this._minutes !== 0) {
      console.error(`Office appointment's time is invalid (should be every :00 minutes): ${this._minutes}`);
      this.invalidTime = true;
      this.message = 'Provided time is invalid. Valid time for the office -appointment is hourly (08.00, 09:00 ->).';
      return true;
    } 
    // Phone -appointments
    else if (this._minutes !== 0 && this._minutes !== 30) {
      console.error(`Phone meeting's time is invalid (should be every :00/:30 minutes): ${this._minutes}`);
      this.invalidTime = true;
      this.message = 'Provided time is invalid for the phone -appointment. Valid time for the appoinment is every half hour.';
      return true;
    }
    return false;
  }


  /**
   * Public function which'll (with the help of DynamoDB-class) check
   * if the user's desired appointment-time is already taken.
   * 
   * Function is isolated from other functions because it uses a lot of
   * asyncronious methods for implementing.
   * 
   * @param {string} pin User's PIN so function can check (in case the wanted
   *  time for appointment is already reserved) if it was the same user who
   *  reserved it
   * @returns Empty promise. Error handling is done in the function already
   */
  public async isTimeTaken(pin: string): Promise<null> {

    const dynamoDB = new DynamoDB();

    return new Promise(async (resolve) => {
      try {
        const res = await dynamoDB.checkAppointmentsForTime(this.dateTime, this._type);

        // No overlapping appointments found
        if (res.Items.length === 0) {
          console.log('No appointments found for date:' + this._date);
          resolve();
        }
        // Found overlapping appointments
        else {
          this.message = res.Items[0].Pin.S === pin ? 
            this.message = 'Seems like you have already booked for this time.' :
            this.message = 'Unfortunately this appointment is already reserved.';
          this.invalidTime = true;
          resolve();
        }
      }
      // Error while checking for appointments
      catch (err) {
        console.error('Error while searching appointments: ' + err);
        this.invalidTime = true;
        this.message = `There were an error while searching for other appointments.`;
        resolve();
      };
    });
  }

}
