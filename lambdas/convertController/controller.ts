const querystring = require('querystring');
const http = require('http');

module.exports.handler = async (event, context) => {

  const URL: string = 'http://ec2-18-202-227-66.eu-west-1.compute.amazonaws.com:3000/convert';

  const post_data = querystring.stringify(
    event['base64string']
  );

  const post_options = {
    host: URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const post_req = http.request(post_options, res => {
    res.setEncoding('UTF-8');
    res.on('data', chunk => {
      console.log('Response: ' + chunk);
      context.succeed();
    });
    res.on('error', e => {
      console.log(e);
      context.done(null, 'FAILURE');
    });
  });

  post_req.write(post_data);
  post_req.end();



  // const URL: string = 'http://ec2-18-202-227-66.eu-west-1.compute.amazonaws.com:3000/convert';
  // const xhttp = new XMLHttpRequest();
  // const base64string: string = event['base64string'];

  // xhttp.open("POST", URL, false);
  // xhttp.setRequestHeader('Content-Type', 'application/json');

  // xhttp.onreadystatechange = () => {
  //   if (Number(this.readyState) == 4 && Number(this.status) == 200) {
  //     console.log(xhttp.responseText);
  //   }
  // }
  // xhttp.send(JSON.stringify({
  //   "base64string": base64string
  // }));
}
