import * as http from 'http';

const options = {
  timeout: 2000,
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health', // 반드시 Dockerfile의 HEALTHCHECK와 동일해야 한다.
};

const request = http.request(options, (response) => {
  console.info('STATUS: ' + response.statusCode);
  process.exitCode = response.statusCode === 200 ? 0 : 1;
  process.exit();
});

request.on('error', function (err) {
  console.error('ERROR', err);
  process.exit(1);
});

request.end();
