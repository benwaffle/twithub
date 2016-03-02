// vim: set et ts=4 sw=4
'use strict';

var Twitter = require('twitter');
var client = new Twitter({
	consumer_key: 'j5oWVtmbD3MnrGtRk0jMOEI4z',
	consumer_secret: 'VfoxZbtrTjeSPVOkuzsmjUB8c6TmIHKsZIZr83MSo0CpN1x72F',
	access_token_key: '704876576337477636-9wsUP6ZuWHsbpHhnSyiOQIkoxd5OalJ',
	access_token_secret: 'IZ06WkLDpmCzvLXf6tTKVYl893xPIV39PK7wUCHovf8qc'
});

// callback: (error, tweet body, raw response object) => {}
function tweet(status, callback) {
	console.log(`Tweeting ${status}`);
	client.post('statuses/update', {status}, callback);
}

//NOT CORRECT, USE in_reply_to_status_id
//https://github.com/mirakui/retrobot/pull/7
function reply(status, callback) {
	client.post('statuses/update', {status}, callback);
}

module.exports = {
	tweet,
	reply,
	linkLength: 23
};
