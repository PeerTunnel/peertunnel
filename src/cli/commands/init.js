'use strict'

/* eslint-disable no-console */

const PeerTunnel = require('../../')

module.exports = {
  command: 'init',
  describe: 'Initialize the PeerTunnel config',
  builder: y => y,
  handler (argv) {
    const tunnel = new PeerTunnel(argv)
    tunnel.init().then(() => {
      console.log('Success!')
      process.exit(0)
    }, (err) => {
      console.error(err.stack)
      process.exit(2)
    })
  }
}
