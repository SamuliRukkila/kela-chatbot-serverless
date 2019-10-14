const moment = require('./libraries/moment.min');

// let date = '2019-11-11';
// let now = moment().format();
// console.log(now.hour());
// console.log(moment(now).format('HH:mm'));
// console.log(moment(date).day());

// console.log(moment(date).hour());
// let foo = 8;
// console.log(moment('09:00 am', 'HH:mm').format());
// console.log(moment('15:45 pm', 'HH:mm').format());

// let a=[8,9,10,11,12,13,14,15,16];

// for (let i = 0; i < a.length; i++) {
//   console.log(a[i] >= 8 && a[i] < 16);
// }
// console.log(foo >= 8 && foo < 16);

const today = moment().minutes();
const date = moment('2019-14-11');
console.log(today);