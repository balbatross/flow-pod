//MongoDB
var express = require('express')
const mongoose = require('mongoose')
const { MongodbPersistence } = require('y-mongodb')

//HTTP
var app = express()
var bodyParser = require('body-parser')
var cors = require('cors')

const WebSocket = require('ws')
const utils = require('y-websocket/bin/utils.js')
var wrtc = require('wrtc')
const WS = require('libp2p-websockets')
var WStar = require('libp2p-webrtc-star')

const YServer = require('./src/yServer')(1234)

var IPFS = require('ipfs')
const routes = require('./src/routes')

const MONGODB_URI = "mongodb://localhost/micro-actions";
const collection = 'yjs-transactions';

app.use(cors())
app.use(bodyParser.json())


async function initIPFS(ipfs){
  let podDir = {};
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



  mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})


  app.use(routes(ipfs))


  require('greenlock-express')
    .init({
      packageRoot: __dirname,
      config: "./greenlock.d",
      maintainerEmail: "professional.balbatross@gmail.com",
      cluster: false
    })
    .serve(app)
}

main();


