fs = require 'fs'
net = require 'net'
logger = require 'winston'
Multiplexer = require './lib/multiplexer.coffee'

configFile = process.argv[2] || "config/config.json"
logger.info "using #{configFile} as configuration source"
config = JSON.parse(fs.readFileSync(configFile))

bindAddress = config.bind_address || "127.0.0.1"
listenPort = config.listen_port || 6000

multiplexer = new Multiplexer(config)

multiplexer.initConnections()

server = net.createServer (socket) ->
  logger.debug 'Connection!'

  socket.on 'end', ->
    logger.debug 'Client disconnected'

  socket.on 'data', (data) ->
    command = data.toString('utf8')
    multiplexer.send command, (err, res) ->
      if err
        logger.error "Got error from primary", err

      if res
        logger.info "Got response from primary"
        socket.write res

      if /quit/i.test(data)
        logger.debug('QUIT command received closing the connection' )
        socket.end()

server.listen(listenPort, bindAddress)
logger.info "Server started on #{bindAddress}:#{listenPort}"

