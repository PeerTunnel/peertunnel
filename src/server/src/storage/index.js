'use strict'

const Common = require('../../../common/storage')

class Storage extends Common {
  getUser (id) {
    return this.getStorable('users', id, {})
  }

  getGlobal () {
    return this.getStorable('global', {})
  }

  async getCert () {
    const self = this
    let save = async function () {
      await self.write('cert.pem', Buffer.from(this.cert))
      await self.write('key.pem', Buffer.from(this.key))
    }
    try {
      return {
        cert: await this.read('cert.pem'),
        key: await this.read('key.pem'),
        save
      }
    } catch (err) {
      return {save}
    }
  }
}

module.exports = Storage
