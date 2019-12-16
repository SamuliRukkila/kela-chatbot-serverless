const speech = require('@google-cloud/speech');
const fs = require('fs');
const random = require('unique-string');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const exec = require('child_process').execFile;
const { ncp } = require('ncp');
const path = require('path');
const chmod = require('chmod');

module.exports.handler = async (event: Object, context: Object, callback: Function) => {

  await ncp(path.join(__dirname, '../ffmpeg/'), '/tmp/ffmpeg', {
    clobber: false
  }, (err: Error) => {
    if (err) throw err;
    else {
      chmod('/tmp/ffmpeg/ffmpeg', {
        execute: true
      });
    }
  });

  const FORMAT: string = 'wav';
  const FOLDER: string = './audio/';
  const FILE_NAME: string = random();
  const FILE_NAME_WAV: string = FILE_NAME + '.wav';
  const LANGUAGE_CODE: string = 'fi-FI';

  const base64string: string = event['base64string'].split(';base64,').pop();
  const client = new speech.SpeechClient();

  console.log('Starting the convertion of file: ' + FILE_NAME);

  await fs.writeFile(FOLDER + FILE_NAME, base64string, { encoding: 'base64' }, (err: Error) => {
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
      .save(FOLDER + FILE_NAME_WAV)
      .on('end', () => {
        console.log(`Finished converting file: ${FILE_NAME} to ${FILE_NAME_WAV}`);
        const audioBytes = fs.readFileSync(FOLDER + FILE_NAME_WAV).toString('base64');

        console.log('Sending .WAV -file to Google API: ' + FILE_NAME_WAV);

        const request = {
          audio: { content: audioBytes },
          config: { languageCode: LANGUAGE_CODE }
        };

        client.recognize(request).then(response => {
          const convertedText = response[0].results
            .map(res => res.alternatives[0].transcript)
            .join('\n');
          console.log(`Successfully converted .WAV -audio file (${FILE_NAME_WAV}) to text: [${convertedText}]`);
          removeFiles();
          callback(null, {
            error: false, msg: convertedText
          });
        }).catch((err: Error) => {
          console.error('Error while calling Google API: ' + err.message);
          removeFiles();
          callback(null, {
            error: true, msg: err.message
          });
        });
      })
  });
  
  /**
   * 
   */
  function removeFiles(): void {
    try {
      fs.unlinkSync(FOLDER + FILE_NAME);
      fs.unlinkSync(FOLDER + FILE_NAME_WAV);
      console.log(`Removed audio files successfully: ` + 
        `${FILE_NAME} & ${FILE_NAME_WAV}`);
    } catch (err) {
      console.error(`Error while trying to delete audio file. Continuing..` +
        `${FOLDER + FILE_NAME} / ${FOLDER + FILE_NAME_WAV}`);
    }
  }

}

