const router = require("express").Router()
const moniker = require('moniker')

const { Pod } = require('../../models')

module.exports = (db, ipfs) => {
  router.route('/')
    .get((req, res) => {
      Pod.find((err, pods) => {
        res.send(err ? {error: err} : pods)
      })
    })
    .post((req, res) => {
      
      let pod = new Pod({
        name: req.body.name,
        nick: moniker.choose()
      })

      pod.save((err, r) => {
        res.send((err) ? {error: err} : r)
      })
    })

  router.route('/join')
    .post((req, res) => {
      
    })
  return router;
}
