# rds

**private**

Provides the RDS (backed by Postgres) connection, configuration, migration
scripts, and associated models.

## Usage

Put `var rds = require ('@the-brain-trust/rds');` in the relevant files.
You can access the models by accessing the `models` property on the returned
module.

## Publishing

`npm publish`
