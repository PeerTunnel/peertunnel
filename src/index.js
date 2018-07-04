'use strict'

const os = require('os')
const Storage = require('./storage')
const path = require('path')

class Peertunnel {
  constructor ({swarm}) {
    this.swarm = swarm
    this.storage = new Storage(path.join(os.homedir(), '.peertunnel'))
  }
}

module.exports = Peertunnel
