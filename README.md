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
```
$ sls invoke local -f <functionName> --path local-test-data/<functionName>/test.json
```
> If local invoke fails because of missing library (for example aws-sdk), download that 
> library locally in root folder `npm i aws-sdk`. These files will be automatically excluded 
> from final build.


