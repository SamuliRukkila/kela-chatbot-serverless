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
$ sls deploy function -f <functionName>`
```


