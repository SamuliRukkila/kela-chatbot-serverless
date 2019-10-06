Kela Chatbot: Serverless
------------------------

Local Lambda-functions using [Serverless](https://serverless.com/) -framework.

Download: 
```
$ npm i serverless -g
```


Serverless
----------

Deploy everything (also when serverless.yml is updated): 

```
$ sls deploy -v
```

Deploy only a specific function (when you have modified 1 function): 
```
$ sls deploy function -f <functionName>
```

Test functions locally (test data found from folder `local-test-data`):

OS: 
```
$ sls invoke local -f <functionName> --path local-test-data/<functionName>/<file>.json
```

Windows:
```
sls invoke local -f KelaUserInformation --path local-test-data\userInformation\<file>.json
```
> If local invoke fails because of missing library (for example aws-sdk), download that 
> library locally in root folder `npm i aws-sdk`. These files will be automatically excluded 
> from final build.

Push mock-data into DynamoDB:

OS:
```
aws dynamodb batch-write.item --request-items file://dynamodb-mock-data/<table-name.json>
```
Windows:
```
aws dynamodb batch-write.item --request-items file:\\dynamodb-mock-data\<table-name.json>
```

