'use strict'

const { Map } = require('immutable')
const path = require('path')
const mkdirp = require('mkdirp')
const fs = require('fs')
const { promisify } = require('util')
const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)

const storable = (storage, path, obj) => {
  const store = Map(obj)
  store.save = () => storage.writeJSON(...path, store.toJS())
  store.id = path.join('.').replace(/\.json$/, '')
}

class Storage {
  constructor (dir) {
    this.dir = dir
  }

  locate (...p) {
    path.join(this.dir, ...p)
  }

  async write (...p) {
    const data = p.pop()
    p = this.locate(...p)
    await mkdirp(path.dirname(p))
    await write(p, data)
  }

  writeJSON (...p) {
    const data = p.pop()
    return this.write(...p, Buffer.from(JSON.stringify(data)))
  }

  read (...p) {
    return read(this.locate(...p))
  }

  async readJSON (...p) {
    return JSON.parse(String(await this.read(...p)))
  }

  async getUser (id) {
    const p = ['users', id + '.json']
    return storable(this, p, await this.readJSON(...p))
  }

  async getGlobal () {
    const p = ['global']
    return storable(this, p, await this.readJSON(...p))
  }

  async getCert () {
    let save = async function () {
      await this.write('cert.pem', Buffer.from(this.cert))
      await this.write('key.pem', Buffer.from(this.key))
    }
    try {
      return {
        cert: await read('cert.pem'),
        key: await read('key.pem'),
        save
      }
    } catch (err) {
      return {save}
    }
  }
}

module.exports = Storage
