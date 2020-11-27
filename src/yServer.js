#!/usr/bin/env node

/**
 * @type {any}
 */
const fs = require('fs')
const WebSocket = require('ws')
const https = require('https')
const http = require('http')

const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('yUtils.js').setupWSConnection

const options = {
  key: fs.readFileSync(__dirname + "/../greenlock.d/live/api.rainbowkereru.com/privkey.pem"),
  cert: fs.readFileSync(__dirname + "/../greenlock.d/live/api.rainbowkereru.com/cert.pem")
}

const port = process.env.PORT || 1234

module.exports = (port) => {

  const sslServer = https.createServer(options, (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plan'})
    res.end('okay')
  })

  const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('okay')
  })

wss.on('connection', setupWSConnection)

  //server.on('upgrade', (req, 

sslServer.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  /**
   * @param {any} ws
   */
  const handleAuth = ws => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

sslServer.listen(port)

  console.log('running on port', port)
}
