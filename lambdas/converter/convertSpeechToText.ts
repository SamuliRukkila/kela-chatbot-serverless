import { Storage } from '@google-cloud/storage';

module.exports.handler = async (event: Object, context: Object, callback: Function) => {

    const speech = require('@google-cloud/speech');
    const fs = require('fs');

    const client = new speech.SpeechClient();
    const fileName = './testi.mp3';

    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');

    const audio = {
      content: audioBytes
    };
    const config = {
      encoding: 'FLAC',
      sampleRateHertz: 16000,
      languageCode: 'fi'
    };
    const request = {
      audio: audio,
      config: config
    };

    client.recognize(request).then(response => {
      console.log(response);
      // const transcription = response.results[0]
      //   .map(result => result.alternatives[0].transcript).join('\n');
      // console.log(`Transcription: ${transcription}`);
    })
  }
  