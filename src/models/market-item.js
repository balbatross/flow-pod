const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MarketItem = mongoose.model('MarketItem', {
  photos: [String],
  name: String,
  tags: [String],
  description: String,
  price: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User' }
})

module.exports = MarketItem 
