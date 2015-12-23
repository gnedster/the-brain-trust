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

### Postgres
You'll need to install postgres version 9.4.x, if you're using OS X:

`brew install postgres`

Look in the config folder to set up the correct database name and credentials
for local development. In an interactive session (like psql), you can do the
following:

`CREATE ROLE thebraintrust WITH PASSWORD 'pwd' CREATEDB CREATEROLE LOGIN;`
`CREATE DATABASE thebraintrust_development;`
