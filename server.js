'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const twitter = require('./twit.js');

const githubToTwitter = {
    'benwaffle': 'benwafflez',
    'khayyamsaleem': 'KhayyamSaleem',
};

var issues = {}; // issue ID => twitter IDs

app.use(bodyParser.json());

app.post('/', (req, res) => {
    let data = req.body;
    let event = req.headers['x-github-event'];
    if (event) {
        let owner = data.repository.owner.login;
        let user = data.sender.login;
        let project = data.repository.name;
        if (event == "issues") {
            let action = data.action;
            let title = data.issue.title;
            let url = data.issue.html_url;
            let twitterUser = githubToTwitter[owner];
            let tweet = `@${twitterUser} ${project}: ${user} ${action} issue "${title}"
${url}`;
            console.log(`Tweeting: ${tweet}`);
            twitter.tweet(tweet, (err, tweet) => {
                if (err)
                    return console.log(err);
                let ghid = data.issue.id.toString();
                let twid = tweet.id_str;
                if (!issues[ghid])
                    issues[ghid] = [];
                issues[ghid].push(twid);
            });
        } else if (event == "issue_comment") {
            let title = data.issue.title;
            let url = data.issue.html_url;
            let comment = data.comment.body;
            let twitterUser = githubToTwitter[owner];
            let tweet = `@${twitterUser} ${project}: ${user} commented on issue "${title}"
${comment}
${url}`;
            console.log(`Tweeting: ${tweet}`);
            twitter.tweet(tweet, (err) => {
                if (err)
                    return console.log(err);
                let ghid = data.issue.id.toString();
                let twid = tweet.id_str;
                if (!issues[ghid])
                    issues[ghid] = [];
                issues[ghid].push(twid);
            });
        } else if (event == "pull_request") {
            let title = data.pull_request.title;
            let url = data.pull_request.html_url;
            let body = data.pull_request.body;
            let twitterUser = githubToTwitter[owner];
            let tweet = `@${twitterUser} ${project}: ${user} submitted a pull request: "${title}"
${body}
${url}`;
        } else {
            console.log(`unknown github event: ${event}`);
        }
    } else {
        console.log("Post request without github event");
    }
    console.log('\n');
    res.send('ok');
});

app.listen(3000, () => {
    console.log("listening on port 3000");
});
