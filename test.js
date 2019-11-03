const moment = require('moment-timezone');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const dynamo = new AWS.DynamoDB();

const time ='2019-08-09T15:00:00';

console.log(moment(time).tz('Europe/Helsinki').format('YYYY-MM-DDTHH:mm:ss'));

