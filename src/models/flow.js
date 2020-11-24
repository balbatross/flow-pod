const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Flow = mongoose.model('Flow', {
  name: String,
  flow: Object,
  project: { type: Schema.Types.ObjectId, ref: 'Project' }
})

module.exports = Flow;
