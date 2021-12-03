const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },

  name: {
    type: String
  },
  bio: {
    type: String
  },

  sos: {
    type: String
  },

  jobtitle: {
    type: String
  },
  contactnumber: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    type: String
  },
  website: {
    type: String,
    required: true
  },

  instagram: {
    type: String,
    required: true
  },
  linkedin: {
    type: String,
    required: true
  },
  facebook: {
    type: String,
    required: true
  },
  whatsapp: {
    type: String,
    required: true
  },
  behance: {
    type: String,
    required: true
  },
  twitter: {
    type: String,
    required: true
  },
  dp: {
    type: String,
    required: true
  },
  serialnumber: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('profile', ProfileSchema);
