const moment = require('./libraries/moment.min');

let date = '2019-11-11';
let now = moment().format();
console.log(moment(now).format('HH:mm'));
console.log(moment(date).day());