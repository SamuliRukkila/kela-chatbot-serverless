const moment = require('moment-timezone');

const string = '2019-01-01T17:00:00';

console.log(moment(string).tz('Europe/Helsinki').format());