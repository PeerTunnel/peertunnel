'use strict'

const Common = require('../../../common/storage')

class Storage extends Common {
  getUser (id) {
    return this.getStorable('users', id, {})
  }

  getGlobal () {
    return this.getStorable('global', {})
  }
}

module.exports = Storage
