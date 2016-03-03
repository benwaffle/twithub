// vim: set et ts=4 sw=4
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const twitter = require('./twit.js');
const github = require('octonode');

var client = github.client(process.env.ACCESS_TOKEN);

const githubToTwitter = {
    'benwaffle': 'benwafflez',
    'khayyamsaleem': 'KhayyamSaleem',
};

var issues = {}; // tweet ID => ['owner/repo', issueNum]

app.use(bodyParser.json());

function lencheck(data){
	if (data == null) {
		return "";
	} else if (data.length >= 80){
		return data.slice(0, 79);
	} else {
		return data;
    }
}

twitter.listen(tweet => {
    let twid = tweet.in_reply_to_status_id_str;
    console.log(`Got tweet ${twid}`);
    if (issues[twid]) {
        console.log(`Replying to ${issues[twid]}`);
        let issue = issues[twid];
        let text = tweet.text.replace('@TwithubB ', '');
        let comment = `**Comment by ${tweet.user.login}**

---

${text}`
        client.issue(issue[0], issue[1]).createComment({ body: comment }, (err, data) => {
            if (err)
                console.log(err);
            console.log(data);
        });
    }
});

app.post('/', (req, res) => {
    let data = req.body;
    let event = req.headers['x-github-event'];
    if (event) {
        let owner = data.repository.owner.login;
        let user = data.sender.login;
        let project = data.repository.name;
        if (event == "issues") {
            let action = data.action;
            let title = lencheck(data.issue.title);
            let url = data.issue.html_url;
            let twitterUser = githubToTwitter[owner];
            let tweet = `@${twitterUser} 🍆 ${project}: ${user} ${action} issue "${title}"
${url}`;
            twitter.tweet(tweet, (err, tweet) => {
                if (err)
                    return console.log(err);
                let twid = tweet.id_str;
                issues[twid] = [data.repository.full_name, data.issue.number];
            });
        } else if (event == "issue_comment") {
            let title = lencheck(data.issue.title);
            let url = data.issue.html_url;
            let comment = data.comment.body;
            let twitterUser = githubToTwitter[owner];
            let tweet = ` @${twitterUser} ಠ_ಠ  ${project}: ${user} commented on issue "${title}"
${comment.slice(0, 79)}
${url}`;
            twitter.tweet(tweet, (err) => {
                if (err)
                    return console.log(err);
                let twid = tweet.id_str;
                issues[twid] = [data.repository.full_name, data.issue.number];
            });
        } else if (event == "pull_request") {
            let action = data.action;
            let title = data.pull_request.title;
            let url = data.pull_request.html_url;
            let body = lencheck(data.pull_request.body);
            let twitterUser = githubToTwitter[owner];
            let tweet = `@${twitterUser} 😕  ${project}: ${user} ${action} a pull request: "${title}"
${body}
${url}`;
            twitter.tweet(tweet, (err) => {
                if (err)
                    return console.log(err);
            });
        } else if (event == watch) {
		let action = data.action;
		let repo = data.repository;
		let url = data.watch.html_url;
		let tweet = `${user} starred ${repo} 🌟
${url}`;
		twitter.tweet(tweet, (err) => {
			if (err)
				return console.log(err);
		});
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
