# web

the brain trust web site. You can find it at <https://the-brain-trust.com>.

## Getting Started

Running the website should be simple.

```
npm install
DEBUG=web:* npm start
```

## Runbook

### Elastic Beanstalk
Follow these [instructions](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
to install the Elastic Beanstalk CLI.

**Note**: You might be getting permissions errors trying to install the EB CLI
client if you're using OS X El Capitan.
Follow these
[instructions](http://stackoverflow.com/questions/32898583/unable-to-install-nltk-on-mac-os-el-capitan/33024464#33024464)
to resolve.

Then use `eb deploy` to push to AWS. Be careful as eb will pick up
local changes. A deployment pipeline should be built out in the near future.

## Development

Outside of node, you'll need a bunch of extra tools to simulate the production
environment.

### Postgres
You'll need to install postgres version 9.4.x, if you're using OS X:

`brew install postgres`

Look in the config folder to set up the correct database name and credentials
for local development. In an interactive session (like psql), you can do the
following:

`CREATE ROLE thebraintrust WITH PASSWORD 'pwd' CREATEDB CREATEROLE LOGIN;`
`CREATE DATABASE thebraintrust_development;`

### Fake OAuth Server
This lightweight server simulates what Slack's OAuth server would receive and
return.

`node ./test/lib/fake-oauth.js`

### Fake SQS Server

This lightweight server emulates the behavior of Amazon's SQS server. Note
that the fake SQS behavior does not match exactly that of a live server.

```
bundle install
fake_sqs
```

You can see more details in [github](https://github.com/iain/fake_sqs).

Note that you'll have the manually create the queues every time.

## Testing

We use mocha, supertest, and chai-as-promised for async assertions.

`npm install -g mocha`.

Make sure that the mock SQS and mock OAuth servers are up.

`fake_sqs`
`node ./test/lib/fake-oauth.js

