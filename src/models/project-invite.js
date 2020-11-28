const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ProjectInvite = mongoose.model('ProjectInvite', {
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  ts: Number,
  message: String,
  status: String,
  invited: { type: Schema.Types.ObjectId, ref: 'User'},
  inviter: { type: Schema.Types.ObjectId, ref: 'User' }
})

module.exports = ProjectInvite 
