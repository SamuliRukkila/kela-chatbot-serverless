const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

/**
 * 
 */

export class DynamoDB {
  
  public searchUserByPin(pin) {
    const params = {
      TableName: 'kela-Customers',
      Key: {
        Pin: pin
      }
    };
  
    // dynamo.get(params, (err, res) => {
    //   if (err) {
    //     return callback(err, null);
    //   } else {
    //     return callback(null, res);
    //   }
    // });
      // .then(res => callback(null, res))
      // .catch(err => callback(err, null));
  }

}