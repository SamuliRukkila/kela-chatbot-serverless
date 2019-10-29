const moment = require('moment-timezone');
const date = moment().tz('Europe/Helsinki').format();
const time = date;

console.log(moment(time).format('DD.MM.YYYY'));
console.log(moment(time).format('HH:mm'));

