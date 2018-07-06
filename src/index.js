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

const Id = require('peer-id')
const Peer = require('peer-info')
const pull = require('pull-stream')
const AdminRPC = require('./rpc/admin')

class Peertunnel {
  constructor () {
    this.storage = new Storage(path.join(os.homedir(), '.peertunnel'))
    this.tunnels = new Tunnels(this)
    this.admin = promisify(this.admin.bind(this))
  }

  async init () {
    if (fs.existsSync(this.storage.locate('config.json'))) {
      console.error('Config %s already exists! Refusing to overwrite!', this.storage.locate('config.json'))
      process.exit(2)
    }

    await this.storage.write('config.json', JSON.stringify(await createConfig(), null, 2))
  }

  async start () {
    this.swarm = await instance(await this.storage.readJSON('config.json'), {addrs: ['/ip4/0.0.0.0/tcp/0']})
    await this.tunnels.start()
  }

  async stop () {
    await this.tunnels.stop()
    await promisify(this.swarm.stop.bind(this.swarm))()
  }

  async resolveServer (name) {
    const id = (await this.storage.getServers()).names[name]
    if (!id) {
      throw new Error('Server ' + name + ' does not exist!')
    }
    const addrs = (await this.storage.getServer(id)).addrs
    const peer = new Peer(Id.createFromB58String(id))
    addrs.forEach(addr => peer.multiaddrs.add(addr))
    return peer
  }

  async resolveServerDefault () {
    const id = (await this.storage.getServers()).default
    if (!id) {
      throw new Error('No default server defined!')
    }
    const addrs = (await this.storage.getServer(id)).addrs
    const peer = new Peer(Id.createFromB58String(id))
    addrs.forEach(addr => peer.multiaddrs.add(addr))
    return peer
  }

  admin (pi, req, cb) {
    this.swarm.dialProtocol(pi, '/peertunnel/admin/1.0.0', (err, conn) => {
      if (err) { return cb(err) }

      pull(
        conn,
        AdminRPC(req, cb),
        conn
      )
    })
  }
}

module.exports = Peertunnel
