fs = require 'fs'
net = require 'net'
logger = require 'winston'

configFile = process.argv[2] || "config/config.json";
logger.info('using '+ configFile + ' as configuration source');
config = JSON.parse(fs.readFileSync(configFile));