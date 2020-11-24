//MongoDB
var express = require('express')
const mongoose = require('mongoose')
const { MongodbPersistence } = require('y-mongodb')

//HTTP
var app = express()
var bodyParser = require('body-parser')
var cors = require('cors')
const server = require('http').createServer(app)

const WebSocket = require('ws')
const utils = require('y-websocket/bin/utils.js')
var wrtc = require('wrtc')
const WS = require('libp2p-websockets')
var WStar = require('libp2p-webrtc-star')

const Y = require('yjs')
var IPFS = require('ipfs')
const routes = require('./src/routes')

const MONGODB_URI = "mongodb://localhost/micro-actions";
const collection = 'yjs-transactions';
const ldb = new MongodbPersistence(MONGODB_URI, collection)

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


  const wss = new WebSocket.Server({ noServer: true})
  wss.on('connection', utils.setupWSConnection);

  server.on('upgrade', (request, socket, head) => {
    const handleAuth = ws => {
      ws.emit('connection', ws, request)
    }
    wss.handleUpgrade(request, socket, head, handleAuth)
  })

    /*utils.setPersistence({
    bindState: async (docName, yDoc) => {
      
      const persistedYDoc = await ldb.getYDoc(docName)
      const newUpdates = Y.encodeStateAsUpdate(yDoc)
      ldb.storeUpdate(docName, newUpdates)
      Y.applyUpdate(yDoc, Y.encodeStateAsUpdate(persistedYDoc))
      yDoc.on('update', async update => {
        ldb.storeUpdate(docName, update)
      })
    },
    writeState: async (docName, yDoc) => {
      return new Promise(resolve => {
          resolve();
      })  
    }
  })*/

  mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})


  app.use(routes(ipfs))

  
  server.listen(8080)
}

main();


