var DocumentDBClient = require('documentdb').DocumentClient;
var docdbUtils = require('./docdbUtils');

function ProfileDao(documentDBClient, databaseId, collectionId) {
  this.client = documentDBClient;
  this.databaseId = databaseId;
  this.collectionId = collectionId;

  this.database = null;
  this.collection = null;
}

ProfileDao.prototype = {
  init: function(callback) {
    var self = this;

    docdbUtils.getOrCreateDatabase(self.client, self.databaseId, function(err, db) {
      if (err) {
        callback(err);
      }

      self.database = db;
      docdbUtils.getOrCreateCollection(self.client, self.database._self, self.collectionId, function(err, coll) {
        if (err) {
          callback(err);
        }

        self.collection = coll;
      });
    });
  },

  /**
  * Get a profile by id.
  * @param {string} id The id of the employee.
  */
  getById: function(id) {
    var self = this;

    var querySpec = {
      query: 'SELECT * FROM root r WHERE r.id=@id',
      parameters: [{
        name: '@id',
        value: id
      }]
    };
    
    return new Promise(function (resolve, reject) {
      self.client.queryDocuments(self.collection._self, querySpec).toArray(function(err, results) {
        if (err) {
          reject(err);
        } 
        
        if(results.length === 1) {
          resolve(results[0]);
        } else {
          reject(new Error("No profile found with id '" + id + "'"));
        }
      });
    });
  },

  add: function(item) {
    var self = this;
    
    return new Promise(function(resolve, reject) {
      self.client.createDocument(self.collection._self, item, function(err, doc) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  },

  update: function(profile) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.client.replaceDocument(profile._self, profile, function(err, replaced) {
          if (err) {
            reject(err);
          } else {
            resolve(replaced);
          }
        });
    });
  }
};

module.exports = ProfileDao;