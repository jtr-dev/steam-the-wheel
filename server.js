const http = require('http')
const path = require('path')
const rp = require('request-promise')

const async = require('async')
const socketio = require('socket.io')
const express = require('express')
const parser = require('simple-xml2json')

const router = express()
const server = http.createServer(router)
const io = socketio.listen(server)

router.use(express.static(path.resolve(__dirname, 'client')))
var messages = []
var sockets = []

io.on('connection', function(socket) {
  sockets.push(socket)
  socket.on('disconnect', function() {})

  socket.on('steamID', function(profile, id) {
    var steamgames = getSteamGames(profile, id);
    setTimeout(function() {
      socket.emit('steamGames', steamgames)
    }, 3500);
  })
})

function getSteamGames(profile, id) {
  // http://steamcommunity.com/profiles/76561197985405022/games?tab=all&xml=1
  var options = {
    method: 'GET',
    url: 'http://steamcommunity.com/' + profile + '/' + id + '/games',
    qs: {
      tab: 'all',
      xml: '1'
    },
    headers: {
      'cache-control': 'no-cache'
    }
  }

  return rp(options)
    .then(function(response) {
      // console.log(response)
      return parser.parser(response)
    })
    .catch(function(err) {
      console.log(err)
      return err
    })
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address()
  console.log("Chat server listening at", addr.address + ":" + addr.port)
})
