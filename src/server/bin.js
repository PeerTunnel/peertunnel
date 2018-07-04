#!/usr/bin/env node

'use strict'

/* eslint-disable no-console */

const Server = require('./src')

const path = require('path')
const fs = require('fs')

const Id = require('peer-id')
const Instance = require('../common/instance')

const argv = require('minimist')(process.argv.slice(2))

const config = {
  genconf: argv.genconf || argv.g || process.env.GENCONF || false,
  config: argv.config || argv.c || process.env.CONFIG || path.join(process.cwd(), 'config.json')
}

const die = (...msg) => {
  console.error('ERROR: ' + msg.shift(), ...msg)
  process.exit(2)
}

if (config.genconf) {
  if (fs.existsSync(config.config)) die('Config %s already exists! Not overwriting...', config.config)
  console.log('Creating %s...', config.config)
  Id.create((err, id) => {
    if (err) { die('Failed to create ID: %s', id) }
    fs.writeFileSync(config.config, JSON.stringify({
      id: id.toJSON()
    }, null, 2))
  })
  return
}

console.log('Launching...')

if (!fs.existsSync(config.config)) { die('Config file %s not found', config.config) }
let conf
try {
  conf = require(path.resolve(process.cwd(), config.config))
} catch (e) {
  die('Error loading %s: %s', config.config, e)
}

if (!conf) { die('Config format error: Not an object') }
if (!conf.id) { die('Config format error: No PeerId (.id) found!') }

const Raven = require('raven')
Raven.config().install()

Instance(conf, {addrs: ['/ip4/127.0.0.1/tcp/32894']}, (err, swarm) => {
  if (err) { die('Cannot create swarm: %s', err) }
  conf.swarm = swarm
  let server = new Server(conf)
  server.start().then(() => {
    server.swarm.peerInfo.multiaddrs.toArray().map(String).forEach(addr => console.log('Listening on %s', addr))
  }, err => die('Starting server failed: %s', err.stack))
})