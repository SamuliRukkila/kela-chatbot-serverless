const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1'});
const dynamodb = new AWS.DynamoDB();
const datetime = '2019-08-09T08:00:00';
const type = 'phone';
console.log('Fetching appointments for: ' + datetime);


const params = {
  TableName: 'kela-Appointments',
  ProjectionExpression: '#sdt, #p',
  ExpressionAttributeNames: {
    '#t': 'Type',
    '#sdt': 'StartDateTime',
    '#p': 'Pin'
  },
  ExpressionAttributeValues: {
    ':t': { S: type },
    ':dt': { S: datetime }
  },
  KeyConditionExpression: '#t = :t AND #sdt = :dt'
};

dynamodb.query(params, (err, res) => {
  if (err) console.log(err);
  else console.log(res);
})