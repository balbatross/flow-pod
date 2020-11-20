var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var cors = require('cors')

var wrtc = require('wrtc')
const WS = require('libp2p-websockets')
var WStar = require('libp2p-webrtc-star')

var IPFS = require('ipfs')
const routes = require('./src/routes')

app.use(cors())
app.use(bodyParser.json())


async function initIPFS(ipfs){
  let podDir;
  try{
  podDir = await ipfs.files.stat('/pod')
  }catch(e){

  }

  if(podDir.type != 'directory'){
    await ipfs.files.mkdir('/pod')
    await ipfs.files.mkdir('/pod/flows')
  }
}

async function main(){
  let transportKey = WStar.prototype[Symbol.toStringTag]
  let ipfs = await IPFS.create({
    config: {
      Addresses: {
        Swarm: ['/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star']
      }
    },
    libp2p:{
      modules: {
        transport: [
          WStar,
          WS
        ],
      },
      config: {
        transport: {
          [transportKey]: {
            wrtc
          }
        },
        peerDiscovery: {
          [WStar.tag]: {
            enabled: true
          }
        }
      }
    }
  })
  await initIPFS(ipfs) 
/*  await ipfs.files.mkdir('/pod')
  await ipfs.files.mkdir('/pod/flows')*/
  app.use(routes(ipfs))


/*  const touch = await ipfs.files.write('/my/file', 'ASDSCSAS ASDSA `')
  const dir = ipfs.files.ls('/my')
  const file = await ipfs.add({
    path: 'hello.txt',
    content: 'Hello World asdasd'
  })
  for await (const item of dir){
      console.log(item)
  }
  console.log(await ipfs.files.stat('/my'))
  let name = await ipfs.name.publish('/ipfs/' + file.cid);/*, (err, res) => {
console.log(err, res)
})*/
  app.listen(8080)
}

main();


