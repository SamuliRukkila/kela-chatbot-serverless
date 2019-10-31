const moment = require('moment-timezone');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const dynamo = new AWS.DynamoDB();


const KELA_DATE='2019-11-01';
const KELA_START_TIME='09:00';

    const startDateTime = moment.utc(
      KELA_DATE + 'T' + KELA_START_TIME).format();
    const endDateTime = moment.utc(
      KELA_DATE + 'T' + KELA_START_TIME)
        .add(45, 'minutes').format();

const params = {
  TableName: 'kela-Appointments',
  ReturnConsumedCapacity: 'TOTAL',
  Item: {
    Type: { S: 'office' },
    Pin: { S: '123123123' },
    AppointmentReason: { S: 'TESTI'},
    StartDateTime: { S: startDateTime },
    EndDateTime: { S: endDateTime },
    FirstName: { S: 'SAM' },
    LastName: { S: 'RUGULS' }
  }
};

dynamo.putItem(params, (err, res) => {
  if (err) console.log(err);
  else {
    console.log('SUCCESSSS');
    console.log(res);
  }
})

// return await dynamo.putItem(params).promise();
