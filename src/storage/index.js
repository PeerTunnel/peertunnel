'use strict'

const Common = require('../common/storage')

class Storage extends Common {
  getServers () {
    return this.getStorable('servers', {default: false, names: {}}) // {default: String, names: {id => name}}
  }

  getServer (id) {
    return this.getStorable('server', id, {}) // {addrs: []}
  }
}

module.exports = Storage
