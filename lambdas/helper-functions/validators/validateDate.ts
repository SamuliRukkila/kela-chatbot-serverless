const moment = require('moment');

export class ValidateDate {

  public date: string;
  public invalidDate: boolean;
  public message: string;

  public validateDate(date: string): void {

    this.date = date;

    if (moment(this.date).isValid()) {
      if (this.isDayInvalid()) return;
      if (this.isWeekDayInvalid()) return;
    } else {
      this.invalidDate = true;
      this.message = 'Provided date is invalid.';
    }
  }
  
  /**
   * 
   */
  private isDayInvalid(): boolean {
    console.log('Checking that date is today or later: ' + this.date);
    const today: string = moment().format();
    if (!moment(this.date).isSameOrAfter(today, 'day')) {
      console.error('Error: Provided date is not today or later.');
      this.invalidDate = true;
      this.message = 'Please provide a date for today or later.';
      return true;
    }
    return false;
  }

  /**
   * 
   */
  private isWeekDayInvalid(): boolean {
    console.log('Checking that date is not saturday/sunday: ' + this.date);
    const day: number = moment(this.date).day();
    // 0 = sunday - 6 = saturday
    if (day === 0 || day === 6) {
      console.error('Error: Provided date is: ' + (day === 6 ? 'saturday' : 'sunday'));
      this.invalidDate = true;
      this.message = 'You can\'t book an appointment for weekend.';
      return true;
    }
    return false;
  }
  
  private isTodayInvalid(): boolean {

    const today: string = moment().format();
    const time = moment(today).format('HH:mm');
    
    if (moment(this.date).isSame(today, 'day')) {
      console.log('Checking date is not too late: ' + this.date);
      
    }
    return false;
  }
};

