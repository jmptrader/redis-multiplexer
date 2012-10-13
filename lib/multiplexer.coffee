redis = require 'redis'

module.exports = class Multiplexer

  # Needs the json config to work properly.
  constructor: (config) ->
    @config = config
    @conns = []

  initConnections: ->
    for srv in @config.servers
      try
        clnt = redis.createClient(srv.port, srv.host, srv.options)
        @conns[srv.weight] = clnt
      catch except
        throw except if config.error.missingIsError == true