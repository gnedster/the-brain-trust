# the brain trust

Welcome to the brain trust.

## Getting started

The top level folders in this repository represent stand-alone projects.
Go into any directory and read the README.md file to get them up and running.

You can see our public facing website at <https://the-brain-trust.com>.

## Runbook

Development is assumed to be under an OS X environment. Node.js will largely
be used for server-side development, strong Javascript skills are a must.

Elastic Beanstalk will be used to host our production environments. We use
[Codeship](https://codeship.com/) for CI and CD.

If you're using [Sublime](<http://www.sublimetext.com/>), you can use the
sublime-settings file found in this repository to be consistent with the rest of
the team.

## Development

Run `npm install`.

We use [mocha](https://mochajs.org/), [eslint](http://eslint.org/),
[csslint](http://csslint.net/) for testing and linting respectively,
so make sure they exist. We also use [grunt](http://gruntjs.com/) for task
running.

`npm install -g mocha eslint grunt-cli`

Also we use [reflow](https://github.com/reenhanced/gitreflow) for creating and
merging branches.

### Ports
Since the project is largely made up of microservices, there are a number of
ports that have been called for:

3000: web
3001: buttonwood

4000: fake-oauth

A proper service discovery solution ought to be implemented, however please
list any ports used by a test server here so that we may avoid collisions.

## Style Guide

For Javascript, we generally follow the
[AirBnb ES5 Javascript](https://github.com/airbnb/javascript/tree/master/es5)
style guide. Folks are welcome to make use ES6, be aware that available features
are highly dependent on the node version.

For CSS/LESS, please refer to
[Medium's LESS style guide](https://gist.github.com/fat/a47b882eb5f84293c4ed).

## Documentation

Part of the culture is to document many of the things; the folks
before you have taken the time to write out their thoughts in the effort that
those reading them are able to contextualize the codebase quickly. If you see
documentation in need of updating or has an error, or even an typo, pay it
forward and help your fellow teammates.

## Contact

Join our Slack team <https://opnd.slack.com>.