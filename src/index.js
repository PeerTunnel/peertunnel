'use strict'

/* eslint-disable no-console */

const os = require('os')
const Storage = require('./storage')
const Tunnels = require('./tunnels')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const _instance = require('./common/instance')
const instance = promisify(_instance)
const createConfig = promisify(_instance.create)

class Peertunnel {
  constructor () {
    this.storage = new Storage(path.join(os.homedir(), '.peertunnel'))
    this.tunnels = new Tunnels(this)
  }

  async init () {
    if (fs.existsSync(this.storage.locate('config.json'))) {
      console.error('Cannot overwrite %s! Please delete it manually!', this.storage.locate('config.json'))
      process.exit(2)
    }

    await this.storage.write('config.json', JSON.stringify(await createConfig(), null, 2))
  }

  async start () {
    this.swarm = await instance(await this.storage.readJSON('config.json'))
    this.server = this.storage.getServers()
    await this.tunnels.start()
  }

  async stop () {
    await this.tunnels.stop()
    await promisify(this.swarm.stop.bind(this))()
  }
}

module.exports = Peertunnel
