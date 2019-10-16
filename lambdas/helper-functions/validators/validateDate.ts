import { Moment } from "moment";

const moment = require('moment-timezone');

/**
 * Validation class which'll completely validate
 * the date.
 */
export class ValidateDate {

  public date: string;
  public invalidDate: boolean;
  public message: string;

  /**
   * Main function which'll call other private 
   * functions to validate the given date.
   * 
   * @param {string} date Date which'll be validated
   */
  public validateDate(date: string): void {

    this.date = moment(date).tz('Europe/Helsinki').format();

    console.log('Validating date: ' + this.date);

    /* If any of the function -calls will return 
       false, validation will be stopped */
    if (moment(this.date).isValid()) {
      if (this.isDayInvalid()) return;
      if (this.isWeekDayInvalid()) return;
      if (this.isTodayInvalid()) return;
      this.date = moment(this.date).tz('Europe/Helsinki').format('DD.MM.YYYY');
    } else {
      this.invalidDate = true;
      this.message = 'Provided date is invalid.';
    }
  }
  

  /**
   * Private function which'll check that preserved date is either
   * today or after that. Dates in past are forbidden and will result 
   * in error.
   * 
   * @returns true if date is today/later, false if in past
   */
  private isDayInvalid(): boolean {

    console.log('Checking that date is today or later: ' + this.date);
    
    const today: string = moment().tz('Europe/Helsinki').format();

    if (!moment(this.date).isSameOrAfter(today, 'day')) {
      console.error('Error: Provided date is not today or later.');
      this.invalidDate = true;
      this.message = 'Please provide a date for today or later.';
      return true;
    }
    return false;
  }


  /**
   * Private function which'll check that preserved day for appointment
   * isn't on weekend (saturday + sunday). Weekend dates are forbidden
   * and will result in error.
   * 
   * @returns true if date is in weekdays, false if in weekend 
   */
  private isWeekDayInvalid(): boolean {

    console.log('Checking that date is not saturday/sunday: ' + this.date);

    const day: number = moment(this.date).tz('Europe/Helsinki').day();

    // sunday(0) & saturday(6)
    if (day === 0 || day === 6) {
      console.error('Error: Provided date is: ' + (day === 6 ? 'saturday' : 'sunday'));
      this.invalidDate = true;
      this.message = 'You can\'t book an appointment for weekend.';
      return true;
    }
    return false;
  }
  

  /**
   * Private function which'll check that today isn't
   * too late to preserve appointment (if user wants to 
   * book an appointment for today). If local time is
   * 15.45 or later, it'll result in error.
   * 
   * @returns true if date isn't today / local time is 15.44 or earlier, 
   *  false if local time is 15.45 or later
   */
  private isTodayInvalid(): boolean {
    /// TODO::: ADD TIMEZONES
    const today: Moment = moment().tz('Europe/Helsinki');
    
    // If date isn't preserved for today, function will simply return false
    if (moment(this.date).isSame(today.format(), 'day')) {

      console.log('Checking today\'s date is not too late (15:45 ->): ' + this.date);

      const hours: number = today.hour();
      const minutes: number = today.minutes();

      // Local time is 15.45 or later
      if (hours > 15 || (hours === 15 && minutes >= 45)) {
        console.log(`Error: It's too for today to reserver appointments.
          Last valid time: 15:45 | Actual time: ${hours}:${minutes}`);

        this.invalidDate = true;
        this.message = 'It is too late to book appointments for today.';
        return true;
      }
    }
    return false;
  }
};

