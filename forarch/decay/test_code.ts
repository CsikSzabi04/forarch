import moment from 'moment';

function oldWay() {
    const now = moment().format('YYYY-MM-DD');
    console.log(now);
    
    // Some request usage
    const request = require('request');
    request('http://www.google.com', function (error, response, body) {
      console.log('error:', error);
    });
}
