const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Pod = mongoose.model('Pod', {

  name: String,
  nick: String,
})

module.exports = Pod 
