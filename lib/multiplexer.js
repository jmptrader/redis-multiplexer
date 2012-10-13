var Multiplexer, logger, redis;

redis = require('redis');
require('./raw');
redis.debug_mode = true;
logger = require('winston');

module.exports = Multiplexer = function Multiplexer(config) {
    this.config = config;
};

Multiplexer.prototype.initConnections = function () {
    var srv, _i;
    this.conns = [];
    this.primeConn = null;
    logger.info("Connecting redis backends ...");


    for (_i in this.config.server) {
        srv = this.config.server[_i];
        logger.debug("Try to connect to " + srv.host + ":" + srv.port);

        if (srv.primary === false) {
            this.conns.push(redis.createClient(srv.port, srv.host, srv.options));
            logger.debug("Selected " + srv.host + ":" + srv.port + " as secondary");
        }
        else {
            logger.debug("Elected " + srv.host + ":" + srv.port + " as primary");
            this.primeConn = redis.createClient(srv.port, srv.host, srv.options);
        }


    }
};

Multiplexer.prototype.send = function (command, callback) {
    var _i;

    logger.debug("Sending command");
    this.primeConn.sendRaw(command, callback);

    logger.debug("Sending secondardies");
    for (_i in this.conns) {
        this.conns[_i].sendRaw(command, function (err, res) {
            logger.debug("Got result from secondary, but ignoring it");
        });
    }
};

Multiplexer.prototype.quit = function () {
    this.primeConn.quit();
    for (var i in this.conns) {
        this.conns[i].quit();
    }
};

