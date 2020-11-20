const router = require('express').Router();
const uuid = require('uuid')

module.exports = (ipfs) => {

  router.get('/', (req, res) => {
    res.send({msg: 'Pod Home'})
  })

  router.get('/info', (req, res) => {
    let id = await ipfs.id()
    let swarm = await ipfs.swarm.peers()
    let info = {
      id: id.id,
      swarm
    }
  })

  router.route('/flows')
  .get(async (req, res) => {
    let dir = ipfs.files.ls('/pod/flows')
    let files = [];
    for await (const file of dir){
      files.push(file)
    }
    res.send({files: files})
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
    res.send({
      cid: result.cid,
      id: flow.id
    })
  })
  .post(async (req, res) => {
    let flow = {
      id: uuid.v4(),
      name: req.body.name,
      flow: req.body.flow,
    }

    let fileName = `/pod/flows/${flow.id}`

    await ipfs.files.write(fileName, JSON.stringify(flow), {create: true})
    let result = await ipfs.files.stat(fileName)
    res.send({
      cid: result.cid,
      id: flow.id,
    })
  })
  return router;
}
