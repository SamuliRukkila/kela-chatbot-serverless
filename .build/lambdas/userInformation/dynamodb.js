"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
/**
 *
 */
var DynamoDB = /** @class */ (function () {
    function DynamoDB() {
    }
    DynamoDB.prototype.searchUserByPin = function (pin) {
        var params = {
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
    };
    return DynamoDB;
}());
exports.DynamoDB = DynamoDB;
//# sourceMappingURL=dynamodb.js.map