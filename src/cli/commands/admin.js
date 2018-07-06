'use strict'

/* eslint-disable no-console */

module.exports = {
  command: 'admin <command>',

  description: 'Administrative operations',

  builder: yargs => yargs.commandDir('admin').option('server', {
    desc: 'Server to work on',
    type: 'string'
  }),

  handler (argv) {
    console.log('Type `peertunnel admin --help` for more instructions')
    argv.tunnel.stop()
  }
}
