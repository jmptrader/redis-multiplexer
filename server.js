/*global require console process*/
/*jslint indent:4*/

var Multiplexer, bindAddress, config, configFile, fs, listenPort, logger, net, redis, server;
fs = require('fs');
net = require('net');
logger = require('winston');
Multiplexer = require('./lib/multiplexer');

configFile = process.argv[2] || "config/config.json";
logger.info("using " + configFile + " as configuration source");
config = JSON.parse(fs.readFileSync(configFile));
bindAddress = config.bind_address || process.env.IP;
listenPort = config.listen_port || process.env.PORT;

server = net.createServer(function (socket) {
    var multiplexer;
    var _socket = socket;

    logger.debug('Client connected. Init Multiplexer for config');
    multiplexer = new Multiplexer(config);
    multiplexer.initConnections();

    socket.on('end', function () {
        logger.debug('Client disconnected');
        multiplexer.quit();
    });

    socket.on('data', function (data) {
        var command = data.toString('utf8');

        logger.debug("command: " + command);

        multiplexer.send(command, function (err, res) {
            logger.info("Primary callback triggered with " + err + ", " + res);
            if (err) {
                logger.error("Got error from primary", err);
            }
            if (res) {
                logger.info("Got response from primary");
                _socket.write(res.toString('utf8'));
            }
            if (/quit/i.test(data)) {
                logger.debug('QUIT command received closing the connection');
                _socket.end();
            }
        });
    });
});

server.listen(listenPort, bindAddress);

logger.info("Server started on " + bindAddress + ":" + listenPort);