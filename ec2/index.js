const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/convert', (req, res) => {
  const speech = require('@google-cloud/speech');
  const fs = require('fs');
  const random = require('unique-string');
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  const ffmpeg = require('fluent-ffmpeg');
  ffmpeg.setFfmpegPath(ffmpegPath);

  const FORMAT = 'wav';
  const FOLDER = './audio/';
  const FILE_NAME = random();
  const FILE_NAME_WAV = FILE_NAME + '.wav';
  const LANGUAGE_CODE = 'fi-FI';

  const base64string = req.body.base64string['base64string']
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

          client
            .recognize(request)
            .then(response => {
              const convertedText = response[0].results
                .map(res => res.alternatives[0].transcript)
                .join('\n');
              console.log(
                `Successfully converted .WAV -audio file (${FILE_NAME_WAV}) to text: [${convertedText}]`
              );
              removeFiles();
              return (
                null,
                {
                  error: false,
                  msg: convertedText
                }
              );
            })
            .catch(err => {
              console.error('Error while calling Google API: ' + err.message);
              removeFiles();
              return (
                null,
                {
                  error: true,
                  msg: err.message
                }
              );
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

app.listen(3000, () => console.log('Server running on port 3000'));
