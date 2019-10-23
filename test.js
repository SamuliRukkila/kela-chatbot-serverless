const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const datetime = '2019-08-09T08:00:00';
const type = 'phone';
console.log('Fetching appointments for: ' + datetime);


const params = {
  TableName: 'kela-Appointments',
  ExpressionAttributeNames: {
    '#t': 'Type',
    '#sdt': 'StartDateTime'
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