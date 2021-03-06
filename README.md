Kela Chatbot: Sumerian
----------------------

Public URL for the application:

https://c50856a46b974123b968e6355ec67dd3.eu-west-1.sumerian.aws/?

For the best possible experience, use device with:

- 1920 x 1080 resolution
- 16:9 aspect ratio
- Chrome browser

For test purposes, use 121212-121F as your PIN.

Kela Chatbot: Serverless
------------------------

Local Lambda-functions using [Serverless](https://serverless.com/) -framework.

Download: 
```
$ npm i serverless -g
```


Serverless
----------

#### Deploy everything (also when serverless.yml is updated): 

```
$ sls deploy -v
```

#### Deploy only a specific function (when you have modified 1 function): 
```
$ sls deploy function -f <functionName>
```

#### Test functions locally (test data found from folder `local-test-data`):

OS: 
```
$ sls invoke local -f <functionName> --path local-lambda-tests/<functionName>/<file>.json
```

Windows:
```
sls invoke local -f <functionName> --path local-lambda-tests\<functionName>\<file>.json
```
> If local invoke fails because of missing library (for example aws-sdk), download that 
> library locally in root folder `npm i aws-sdk`. These files will be automatically excluded 
> from final build.

#### Push mock-data into DynamoDB:

```
aws dynamodb batch-write-item --request-items file://dynamodb-mock-data/<table-name.json>
```
