import { TranslateTextResponse } from "aws-sdk/clients/translate";

const http = require('http');
const AWS = require('aws-sdk'); 
const translate = new AWS.Translate();

exports.handler = async (event: Event) => new Promise(async (resolve) => {

  const token = 
    await post({ base64string: event['base64string'] });

  if (token['error']) return resolve(token);

  const params = {
    SourceLanguageCode: 'fi',
    TargetLanguageCode: 'en',
    Text: token['msg'],
    TerminologyNames: [
      'Kela_Terminology'
    ]
  }

  translate.translateText(params, (err: Error, data: TranslateTextResponse) => {
    if (err) {
      console.error(err);
      return resolve({ error: true, msg: err.message });
    } 
    else {
      return resolve({ error: false, msg: data.TranslatedText });
    }
  });
});

const options = {
  host: 'ec2-18-202-18-6.eu-west-1.compute.amazonaws.com',
  path: '/convert',
  port: 80,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}

/**
 * Makes a POST -request to Node.js REST-API resting in EC2,
 * which will convert finnish speech into finnish text.
 * @param payload 
 */
const post = (payload) => new Promise((resolve, reject) => {
  const req = http.request(options, res => {
    let buffer = '';
    res.on('data', chunk => buffer += chunk)
    res.on('end', () => resolve(JSON.parse(buffer)))
  });
  req.on('error', e => reject(e.message));
  req.write(JSON.stringify(payload));
  req.end();
})