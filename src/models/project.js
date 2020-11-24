const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Project = mongoose.model('Project', {
  name: String,
  nick: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User' }
})

module.exports = Project
