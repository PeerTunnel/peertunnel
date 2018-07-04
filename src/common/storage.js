'use strict'

// const { Map } = require('immutable')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const mkdirp = promisify(require('mkdirp'))

const storable = (storage, path, obj) => {
  // const store = Map(obj)
  const store = obj
  // store.save = () => storage.writeJSON(...path, store.toJS())
  store.save = () => storage.writeJSON(...path, store)
  store.delete = () => fs.unlinkSync(storage.locate(...path))
  store.id = path.join('.').replace(/\.json$/, '')

  return store
}

class Storage {
  constructor (dir) {
    this.dir = dir
  }

  locate (...p) {
    return path.join(this.dir, ...p)
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

  async getStorable (...p) {
    const def = p.pop()
    p[p.length - 1] += '.json'
    let data

    try {
      data = await this.readJSON(...p)
    } catch (err) {
      data = def
    }

    return storable(this, p, data)
  }
}

module.exports = Storage
