'use strict'

const lp = require('pull-length-prefixed')
const pull = require('pull-stream')
const ppb = require('pull-protocol-buffers')
const promisify = require('promisify-es6')
const handshake = require('pull-handshake')
const debug = require('debug')
const log = debug('peertunnel:rpc')

function wrapper (shake, Recieve, Send, opt) {
  let done = false
  return {
    read: promisify((cb) => lp.decodeFromReader(shake, opt || {}, (err, data) => {
      if (err) { return cb(err === true ? new Error('Connection dropped') : err) }
      let res
      try {
        res = Recieve.decode(data)
      } catch (err) {
        return cb(err)
      }
      return cb(null, res)
    })),
    write: promisify((data, cb) => {
      pull(
        pull.values(Array.isArray(data) ? data : [data]),
        ppb.encode(Send),
        pull.collect((err, res) => {
          if (err) { return cb(err) }
          res.forEach(res => shake.write(res))
          cb()
        })
      )
    }),
    rest: () => {
      done = true
      return shake.rest()
    },
    done: () => done
  }
}

module.exports = (Recieve, Send, Handler) => (...a) => {
  const stream = handshake()
  const shake = stream.handshake
  const rpc = wrapper(shake, Recieve, Send)

  const cb = typeof a[a.length - 1] === 'function' && a[a.length - 1]

  Handler(rpc, ...a).then((res) => {
    if (!rpc.done()) { // if rest wasn't called, close stream here
      log('close stream')
      pull(pull.values([]), rpc.rest(), pull.abort(true))
    }

    if (cb) { cb(null, res) }
  }).catch((err) => cb ? cb(err) : log(err))

  return stream
}
