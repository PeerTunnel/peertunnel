'use strict'

/* eslint-disable no-console */

module.exports = {
  command: 'id',

  description: 'Shows the ID of your peer',

  builder: yargs => yargs,

  handler (argv) {
    console.log(argv.tunnel.swarm.peerInfo.id.toB58String())
    argv.tunnel.stop()
  }
}
