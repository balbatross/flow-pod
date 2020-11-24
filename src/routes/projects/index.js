const router = require('express').Router();
const moniker = require('moniker')
const uuid = require('uuid')
const { Project, Flow } = require( '../../models')

module.exports = (ipfs) => {

  router.route('/')
    .get((req, res) => {
      Project.find({owner: req.user.id}, (err, arr) => {
        res.send((err) ? {error: err}: arr)
      })
    })
    .post((req, res) => {
      let project = new Project({
        name: req.body.name,
        nick: moniker.choose(),
        owner: req.user.id
      })

      project.save((err, doc) => {
        res.send((err) ? {error: err} : doc)
      })
    })
    .put((req, res) => {

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
  
    try{
    result = await ipfs.files.stat(fileName)
  
   if(result.cid){
     await ipfs.files.rm(fileName)
   }
  }catch(e){

  }
    console.log(JSON.stringify(flow))
     await ipfs.files.write(fileName, JSON.stringify(flow), {create: true})
   
    result = await ipfs.files.stat(fileName)
    db.collection('flows').updateOne({
      id: flow.id,
    }, {$set: {name: flow.name, flow: flow.flow, cid: result.cid}}, (err, r) => {
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
