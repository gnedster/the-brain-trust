var Sequelize = require('sequelize');
var sequelize = require('../sequelize');

/**
 * Registered applications. Applications will identified using an index
 * @type {Model}
 */
var Application = sequelize.define('Application', {
  name: {
    type: Sequelize.STRING,
    allowNull : false,
    unique: true,
    validate: {
      is: /^[a-z]+$/
    }
  },
  author: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  shortDescription: {
    type: Sequelize.STRING,
    field: 'short_description',
    allowNull: false
  },
  changelog: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  contact: {
    type: Sequelize.STRING,
    allowNull: false,
    isEmail: true
  },
  lastPublishedAt: {
    type: Sequelize.DATE,
    field: 'last_published_at',
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  messagesReceived: {
    type: Sequelize.BIGINT,
    field: 'messages_received',
    defaultValue: 0
  },
  messagesSent: {
    type: Sequelize.BIGINT,
    field: 'messages_sent',
    defaultValue: 0
  },
  authorizations: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  pageViews: {
    type: Sequelize.INTEGER,
    field: 'page_views',
    defaultValue: 0
  },
  public: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  logoExtension: {
    type: Sequelize.STRING,
    validate: {
      is: /^.[a-z]+$/
    }
  }
}, {
  instanceMethods: {
    /**
     * Get the default show path for the application
     * @return {String} Absolute path to show application
     */
    getPath: function() {
      return `/applications/${this.name}`;
    },
    /**
     * Get the authorize path for users to begin OAuth 2 process
     * @return {String} Absolute path for authorization
     */
    getAuthorizePath: function(platformName, state) {
      return `${this.getPath()}/${platformName}/add?state=${state}`;
    }
  }
});

module.exports = Application;
