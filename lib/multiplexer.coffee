redis = require 'redis'
require './raw'
logger = require 'winston'


module.exports = class Multiplexer

  # Needs the json config to work properly.
  constructor: (config) ->
    @config = config
    @conns = []
    @primeConn = null

  initConnections: ->
    logger.info "Connecting redis backends ..."
    for srv in @config.server
      try
        logger.debug "Try to connect to #{srv.host}:#{srv.port}"

        clnt = redis.createClient(srv.port, srv.host, srv.options)

        if srv.primary is false
          logger.debug "Selected #{srv.host}:#{srv.port} as secondary"
          @conns[srv.weight] = clnt

        if srv.primary is true
          logger.debug "Elected #{srv.host}:#{srv.port} as primary"
          @primeConn = clnt

      catch except
        logger.error(except)
        #throw except if config.error.missingIsError == true


  send: (command, callback) ->
    logger.debug "Sending command #{command} to prime"
    @primeConn.sendRaw command, callback

    logger.debug "Sending command #{command} to each secondary"
    for conn in @conns
      conn.sendRaw command (err, res) ->
        if err
          logger.error "Got error from secondary", err

        if res
          logger.info "Received result from secondary"

    return
