const amazonProductApi = require('amazon-product-api');

module.exports = amazonProductApi.createClient({
  awsId: process.env.AWS_ACCESS_KEY_ID,
  awsSecret: process.env.AWS_SECRET_ACCESS_KEY,
  awsTag: process.env.AMAZON_ASSOCIATE_TAG
});
