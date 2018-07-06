'use strict'

/* eslint-disable no-console */

module.exports = {
  command: 'servers <command>',

  description: 'Server operations',

  builder: yargs => yargs.commandDir('servers'),

  handler (argv) {
    console.log('Type `peertunnel servers --help` for more instructions')
    argv.tunnel.stop()
  }
}
