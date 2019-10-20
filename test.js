const moment = require('moment-timezone');

const time = '08:00';

console.log(moment(time, 'HH:mm').tz('Europe/Helsinki').format());