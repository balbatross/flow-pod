const router = require('express').Router();
const moniker = require('moniker')
const async = require('async')
const uuid = require('uuid')
const { ProjectInvite, User, Project, Flow } = require( '../../models')

module.exports = (ipfs) => {

  router.route('/')
    .get((req, res) => {
      Project.find().or([{owner: req.user.id}, {members: req.user.id}])
        .populate('members')
        .populate('owner')
        .exec((err, arr) => {
        res.send((err) ? {error: err}: arr)
      })
    })
    .post((req, res) => {
      let project = new Project({
        name: req.body.name,
        briefDescription: req.body.description,
        nick: moniker.choose(),
        public: req.body.public,
        owner: req.user.id
      })

      project.save((err, doc) => {
        res.send((err) ? {error: err} : doc)
      })
    })
    .put((req, res) => {
      Project.updateOne({_id: req.body._id}, {
        briefDescription: req.body.brief,
        missionStatement: req.body.mission
      }, {omitUndefined: true}, (err) => {
        res.send((err) ? {error: err} : {success: true})
      })
    })

  router.route('/public')
    .get((req, res) => {
      Project.find({public: true}, (err, arr) => {
        res.send((err) ? { error: err } : arr)
      })
    })
  router.route('/invites')
    .get((req, res) => {
      ProjectInvite.find({
        invited: req.user.id
      })
      .populate('project')  
      .populate('invited')
      .populate('inviter').exec((err, doc) => {
        res.send((err) ? {error: err} : doc)
      })
    })


  router.route('/:id')
    .get((req, res) => {
      Project.findOne({_id: req.params.id}, (err, project) => {
        res.send((err) ? {error: err} : project)
      })
    })
    .delete((req, res) => {
      Project.deleteOne({_id: req.params.id, owner: req.user.id}, (err) => {
        res.send((err) ? {error: err} : {success: true})
      })
    })


  router.route('/:id/members')
    .get((req, res) => {
      async.parallel([
        (cb) => {
      Project.findOne({_id: req.params.id}).populate('owner').populate('members').exec((err, project) => {
        cb(err, project)
      })
        }, 
        (cb) => {
         ProjectInvite.find({project: req.params.id})
        .populate('invited')
        .populate('inviter')
        .exec((err, invites) => {
          cb(err, invites)
        })
      }],
        (err, result) => {
          res.send((err) ? {error: err} : {
            members: [
              ...result[0].members,
              ...result[1].map((x) => ({
                ...(x.invited || {})._doc,
                status: "pending"
              }))
            ]
          })
        })

    })
    .post((req, res) => {
      Project.updateOne({_id: req.params.id, owner: req.user.id}, {
        members: req.body.members
      }, (err) => {
        res.send((err) ? {error: err}: {success: true})
      })
    })


  router.route('/:id/members/join')
    .post((req, res) => {
      ProjectInvite.findOne({
          project: req.params.id,
          invited: req.user.id,
      }, (err, invite) => {
        if(!err && invite){
          Project.findOne({_id: invite.project}, (err, project) => {
            let m = project.members;
            if(!m) m = [];
            if(m.indexOf(req.user.id) < 0){
            m.push(req.user.id)
            Project.updateOne({_id: req.params.id}, {members: m}, (err) => {
              ProjectInvite.deleteOne({_id: invite._id}, (err) => {
                res.send((err) ? {error: err} : {success: true})
              })
            })
            }else{ 
              ProjectInvite.deleteOne({_id: invite._id}, (err) => {
                res.send((err) ? {error: err} : {success: true})
              })
            }
          })
        }
      })
    })

  router.route('/:id/members/invite')
    .post((req, res) => {
      let invite = new ProjectInvite({
        project: req.params.id,
        ts: new Date().getTime(),
        message: "Come join my project",
        invited: req.body.invited,
        inviter: req.user.id,
        status: "PENDING"
      })

      invite.save((err) => {
        res.send((err) ? {error: err} : {success: true})
      })
    }).get((req, res) => {
      ProjectInvite.find({project: req.params.id})
        .populate('invited')
        .populate('inviter')
        .exec((err, invites) => {
        res.send((err) ? {error: err} : invites)
    })
  })

  router.get('/:id/members/suggestions', (req, res) => {
    User.find({}).exec((err, arr) => {
      res.send((err) ? {error: err} : arr.map((x) => ({
        username: x.username,
        name: x.name,
        id: x._id
      })))
    })
  })


  router.route('/:id/flows')
    .get(async (req, res) => {
      Flow.find({project: req.params.id}, (err, files) => {
      res.send({files: files})
    })
  })
  .put(async (req, res) => {
    let flow = Object.assign({}, {
      id: req.body.id,
      name: req.body.name,
      flow: req.body.flow
    })
    let fileName = `/pod/flows/${flow.id}`
    let result;
  
   
  
    db.collection('flows').updateOne({
      id: flow.id,
    }, {$set: {name: flow.name, flow: flow.flow}}, (err, r) => {
    res.send({
      cid: result.cid,
      id: flow.id
    })
    })
  })
  .post(async (req, res) => {
    let flow = new Flow({
      id: uuid.v4(),
      name: req.body.name,
      flow: req.body.flow ||{
        nodes: [{id: '19', position: {x: 400, y: 400}, type: "nodeInner", data: {label: "First Node"}}],
        links: []
      },
      project: req.params.id
    })

    let fileName = `/pod/flows/${flow.id}`
    
    flow.save((err, doc) => {
      res.send((err) ? {error: err} : doc)
    })
  })
  return router;
}
