const speech = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const random = require('unique-string');

module.exports.handler = async (event: Object, context: Object, callback: Function) => {

  const FORMAT: string = 'wav';
  const FOLDER: string = './audio/';
  const FILE_NAME: string = random();
  const FILE_NAME_WAV: string = FILE_NAME + '.wav';
  const LANGUAGE_CODE: string = 'fi-FI';

  const base64string: string = event['base64string'].split(';base64,').pop();
  const client = new speech.SpeechClient();

  fs.writeFile(FOLDER + FILE_NAME, base64string, { encoding: 'base64' }, err => {
    if (err) throw err;
    console.log('New file created for conversion: ' + FILE_NAME);

    ffmpeg(FOLDER + FILE_NAME)
      .toFormat(FORMAT)
      .on('error', (err: Error) => {
        console.error('Error occured while converting: ' + err.message);
      })
      .on('progress', progress => {
        console.log(JSON.stringify(progress));
        console.log('Processing conversion: ' + progress.targetSize + ' KB converted');
      })
      .on('end', () => {
        console.log('Finished converting file: ' + FILE_NAME);
      })
      .save(FOLDER + FILE_NAME_WAV, {
        success: () => {
          const audioBytes = fs.readFileSync(FOLDER + FILE_NAME_WAV).toString('base64');

          const request = {
            audio: { content: audioBytes },
            config: { languageCode: LANGUAGE_CODE }
          }
          console.log('Tänne');
          client.recognize(request).then(res => {
            console.log(res);
          });
        }
      });
  });
}

