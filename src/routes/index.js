const router = require('express').Router();
const moniker = require('moniker')
const uuid = require('uuid')
const jwt = require('jsonwebtoken')
const eJwt = require('express-jwt')

const multer = require('multer')
const upload = multer({ dest: '/data/uploads/'})

const crypto = require('crypto')

const podRouter = require('./pods')
const marketRouter = require('./market')
const projectRouter = require('./projects')
const { Flow, User } = require('../models')
const JWT_SECRET = 'SOmething secret';

module.exports = (ipfs) => {

  router.get('/', (req, res) => {
    res.send({msg: 'Pod Home'})
  })

  router.use(['/market/stock', '/projects'], eJwt({secret: JWT_SECRET, algorithms: ['HS256']}))

  router.use('/market', marketRouter(ipfs, upload))
  router.use('/pods', podRouter(ipfs))
  router.use('/projects', projectRouter(ipfs))

  router.get('/info', async (req, res) => {
    let id = await ipfs.id()
    let swarm = await ipfs.swarm.peers()
    let info = {
      id: id.id,
      swarm
    }
    res.send(info)
  })

  router.route('/signup')
    .post((req, res) => {

      let password = crypto.createHash('sha256').update(req.body.password).digest('hex')
      let user = new User({
        username: req.body.username,
        password: password,
        name: req.body.name
      })

      user.save((err, r) => {
        res.send({success: true})
      })
    })

    

  router.route('/auth')
    .post((req, res) => {

      let password = crypto.createHash('sha256').update(req.body.password).digest('hex')
      User.findOne({
          username: req.body.username,
        password: password 
      }, (err, user) => {
        if(!err && user){
          let token = jwt.sign({
            id: user._id,
            username: user.username,
            name: user.name,
          }, JWT_SECRET)
          res.send({success: true, token: token})
        }else{
          res.send({error: err})
        }
      })
    })

  router.route('/flows/:id')
    .get((req, res) => {
      Flow.findOne({_id: req.params.id}, (err, flow) => {
        res.send((err) ? {error: err} : flow)
      })  
    })

  return router;
}
