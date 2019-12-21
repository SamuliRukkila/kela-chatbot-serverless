# EC2 Container

This is the source code of the EC2-container in AWS, which contains 
the convertion using `ffmpeg` and `Google Speech-to-Text` -API.

This source code is here just to show the contents and how the convertion
is done, it has no other purpose.

EC2 Container is a simple Node.js REST-API which acceps HTTP POST -requests,
with `base64string` which it'll convert.

### Why not just use Lambda?

In order to convert finnish speech to finnish text, and eventually to 
english text, `ffmpeg` -library were needed. This library also needs
other source files than NPM-libraries, so we needed to create own Linux-
server for it which has the ability to install necessary packages.

