'use strict'

var shortid     = require('shortid'),
    mongoose    = require('mongoose'),
    Schema      = mongoose.Schema;

var Users = new Schema ({
  username: {
    type:       String,
    required:   true,
    unique:     true,
    maxlength:  [20, 'username too long']
  },
  _id: {
    type:      String,
    index:     true,
    default:   shortid.generate
  }
})

module.exports = mongoose.model('Users', Users);