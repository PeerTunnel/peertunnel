'use strict'

const lp = require('pull-length-prefixed')
const pull = require('pull-stream')
const ppb = require('pull-protocol-buffers')

module.exports = (shake, Request, Response, opt) => {
  return {
    read: (cb) => lp.decodeFromReader(shake, opt || {}, (err, data) => {
      if (err) { return cb(err) }
      let res
      try {
        res = Request.decode(data)
      } catch (err) {
        return cb(err)
      }
      return cb(null, res)
    }),
    write: (data, cb) => {
      if (!cb) cb = () => {}
      pull(
        pull.values(Array.isArray(data) ? data : [data]),
        ppb.encode(Response),
        pull.collect((err, res) => {
          if (err) { return cb(err) }
          res.forEach(res => shake.write(res))
          cb()
        })
      )
    }
  }
}
