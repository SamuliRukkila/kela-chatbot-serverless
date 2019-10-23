const moment = require('moment-timezone');

const time = moment('2019-01-01T17:30:00').utc().format();

console.log(time);