#! /usr/bin/env node

'use strict'

/* eslint-disable no-console */

const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const readPkgUp = require('read-pkg-up')
const PeerTunnel = require('../')

const pkg = readPkgUp.sync({cwd: __dirname}).pkg
updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
}).notify()

const cli = yargs
  .option('config', {
    desc: 'Alternative config location',
    type: 'file'
  })
  .commandDir('commands')
  .demandCommand(1)
  .help()
  .fail((msg, err, yargs) => {
    if (err) {
      throw err // preserve stack
    }
    yargs.showHelp()
  })

const args = process.argv.slice(2)

// Need to skip to avoid locking as these commands
// don't require a daemon
if (args[0] === 'daemon' || args[0] === 'init') {
  cli
    .strict(false)
    .completion()
    .parse(args)
} else {
  // here we have to make a separate yargs instance with
  // only the `config` option because we need this before doing
  // the final yargs parse where the command handler is invoked..
  yargs().option('config').parse(process.argv, (err, argv, output) => {
    if (err) {
      throw err
    }
    const tunnel = new PeerTunnel(argv)
    tunnel.start().then(() => {
      cli
        .strict(false)
        .completion()
        .parse(args, { tunnel })
    }).catch(err => {
      console.error(err.stack)
      process.exit(2)
    })
  })
}
