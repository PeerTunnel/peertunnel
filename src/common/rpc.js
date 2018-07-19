'use strict'

const PBRPC = require('pull-pb-rpc')
const pull = require('pull-stream')
const debug = require('debug')
const log = debug('peertunnel:rpc')
const {Error} = require('./proto')

module.exports = (Recieve, Send, Handler) => (...a) => {
  const stream = PBRPC({timeout: 60 * 60 * 1000}) // TODO: fix for real
  const {rpc} = stream
  rpc.write = rpc.write.bind(null, Send)
  rpc.read = rpc.read.bind(null, Recieve)

  const cb = typeof a[a.length - 1] === 'function' && a[a.length - 1]

  Handler(rpc, ...a).then((res) => {
    if (!rpc.rested()) { // if rest wasn't called, close stream here
      log('close stream')
      pull((end, cb) => cb(end || true), rpc.rest(), (read) => read(true, () => {}))
    }

    if (cb) { cb(null, res) }
  }).catch((err) => {
    if (cb) {
      cb(err)
    } else {
      log(err)
      if (!rpc.rested()) { rpc.write({error: Error.OTHER}) } // if no cb assume we are server and send error via rpc
    }
  })

  return stream
}
