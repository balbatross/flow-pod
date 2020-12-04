const uuid = require('uuid')
const router = require('express').Router();
const async = require('async')
const { User, MarketItem } = require('../../models')
module.exports = (ipfs, upload) => {
  //Get 
  router.route('/')
    .get((req, res) => {
      MarketItem.find()
        .populate('owner')
        .exec((err, items) => { 
          res.send((err) ? {error: err} : { 
            stock: items
          })
        })
    })
    .put((req, res) => {

    })

  router.route('/stock/:id')
    .delete((req, res) => {
      MarketItem.deleteOne({_id: req.params.id, owner: req.user.id}, (err) => {
        res.send((err) ? {error: err} :{success: true})
      })
    })
    .put(upload.array('photos', 12), (req, res) => {
      console.log("Update market item", req.body, req.files)
      MarketItem.updateOne({_id: req.params.id, owner: req.user.id}, {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        tags: req.body.tags,
        $push: {
          photos: { 
            $each: req.files && req.files.length > 0 && req.files.map(x => x.filename)
          }
        }
      }, {omitUndefined: true}, (err) => {
        res.send((err) ? {error: err} : {success: true})
      })
    })

  //Update stock information
  router.route('/stock')
    .get((req, res) => {
      MarketItem.find({owner: req.user.id}).exec((err, arr) => {
        res.send((err) ? {error : err} : arr)
      })
    })
    .post(upload.array('photos', 12), (req, res) => {
      let stockItem = new MarketItem({
        owner: req.user.id,
        name: req.body.name,
        description: req.body.description,
        tags: req.body.tags,
        photos: req.files.map(x => x.filename),
        price: req.body.price
      })

      stockItem.save((err, r) => {

        res.send((err) ? {error: err} : r)
      })
    })
    .put((req, res) => {
     
    })

  router.route('/media/:id')
    .get((req, res) => {
      res.sendFile(`/data/uploads/${req.params.id}`)
    })
  router.route('/:id/media')
    .get((req, res) => {
      MarketItem.find((err, stocks) => {
          let stock = stocks.filter((a) => a._id == req.params.id)[0]
        if(stock && stock.photos && stock.photos.length > 0){
          console.log(stock.photos)
          res.sendFile(stock.photos[0])
        }
      })
    })

  //Get creator information
  router.route('/creator/:creator')
    .get((req, res) => {
      User.findOne({_id: req.params.creator}, (err, user) => {
      MarketItem.find({owner: req.params.creator}).populate('owner').exec((err, items) => {
        if(!err){
          res.send({ 
            creator: user,
            items: items
          })
        }
      })
      })
    })

return router
}
