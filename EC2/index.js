const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const random = require('unique-string');
const port = process.env.PORT || 8080;
const perf = require('execution-time')();
require('log-timestamp');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port, () => console.log('Server running on port: ', port));


const FORMAT = 'wav';
const FOLDER = './audio/';
const FILE_NAME = random();
const FILE_NAME_WAV = FILE_NAME + '.wav';
const LANGUAGE_CODE = 'fi-FI';

const speech = require('@google-cloud/speech');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

app.post('/convert', (req, res) => {
  
  perf.start();

  if (!req.body || !req.body.base64string) {
    console.log('Base64string is null; returning 500-error');
    console.log('Execution took: ' + perf.stop().time + ' milliseconds');
    return res.status(500).send({ error: true, msg: 'Body (base64string) was empty!' });
  }
  
  const base64string = req.body.base64string
    .split(';base64,')
    .pop();
  const client = new speech.SpeechClient();

  console.log('Starting the convertion of file: ' + FILE_NAME);

  fs.writeFile(
    FOLDER + FILE_NAME,
    base64string,
    { encoding: 'base64' },
    err => {
      if (err) throw err;
      console.log('New file created for conversion: ' + FILE_NAME);

      ffmpeg(FOLDER + FILE_NAME)
        .toFormat(FORMAT)
        .on('error', err => {
          console.error('Error occured while converting: ' + err.message);
        })
        .on('progress', progress => {
          console.log(JSON.stringify(progress));
          console.log(
            'Processing conversion: ' + progress.targetSize + ' KB converted'
          );
        })
        .save(FOLDER + FILE_NAME_WAV)
        .on('end', () => {
          console.log(
            `Finished converting file: ${FILE_NAME} to ${FILE_NAME_WAV}`
          );
          const audioBytes = fs
            .readFileSync(FOLDER + FILE_NAME_WAV)
            .toString('base64');

          console.log('Sending .WAV -file to Google API: ' + FILE_NAME_WAV);

          const request = {
            audio: { content: audioBytes },
            config: { languageCode: LANGUAGE_CODE }
          };

	  return client
            .recognize(request)
            .then(response => {
              const convertedText = response[0].results
                .map(res => res.alternatives[0].transcript)
                .join('\n');
              console.log(
                `Successfully converted .WAV -audio file (${FILE_NAME_WAV}) to text: [${convertedText}]`
              );
              removeFiles();
	      console.log('Execution took: ' + perf.stop().time + ' milliseconds');
	      return res.send({ error: false, msg: convertedText });
            })
            .catch(err => {
              console.error('Error while calling Google API: ' + err.message);
              removeFiles();
	      console.log('Execution took: ' + perf.stop().time + ' milliseconds');
              return res.status(500).send({ error: true, msg: err.message });
            });
        });
    }
  );
});

function removeFiles() {
  try {
    fs.unlinkSync(FOLDER + FILE_NAME);
    fs.unlinkSync(FOLDER + FILE_NAME_WAV);
    console.log(
      `Removed audio files successfully: ` + `${FILE_NAME} & ${FILE_NAME_WAV}`
    );
  } catch (err) {
    console.error(
      `Error while trying to delete audio file. Continuing..` +
        `${FOLDER + FILE_NAME} / ${FOLDER + FILE_NAME_WAV}`
    );
  }
}

