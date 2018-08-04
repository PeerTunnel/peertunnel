'use strict'

const debug = require('debug')
const log = debug('peertunnel:server:admin-rpc')

const RPC = require('../../../common/rpc')
const {AdminRequest, AdminResponse, OP, Error} = require('../../../common/proto')
const assert = require('assert')
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const userProps = {
  username: (buf) => {
    buf = String(buf)
    assert('must be 16 or less chars', buf.length > 16)
    assert('must be lowercase alphanum', buf.match(/^[a-z0-9]$/))
    return buf
  }
}

/*

This admin API is a quick-and-dirty hack.

Things to change:
 - Make the protocol more intuitive
 - Check if username is already in DB on rename
 - Maybe split up methods
 - Don't create users through changes (currently set-username is the same as add)
 - Better errors (MALFORMED and OTHER are too generic)

*/

module.exports = RPC(AdminRequest, AdminResponse, async (rpc, pi, admins, main) => {
  if (admins.indexOf(pi.id.toB58String()) === -1) {
    log('admin rpc: UNAUTHORIZED ACCESS BY %s', pi.id.toB58String())
    return rpc.write({error: Error.NOT_AUTHORIZED})
  }

  const req = await rpc.read()

  log('admin rpc %s %s %s on %s', req.type, req.key, req.value, req.userId || '<GLOBAL>')
  if (req.userId) {
    const user = await main.storage.getUser(req.userId)
    switch (req.type) {
      case OP.ADD: {
        let offset = rand(1, 5)
        user.username = req.userId.substr(2 + offset, 18 + offset).toLowerCase()

        await user.save()
        break
      }
      case OP.SET: {
        const prop = userProps[req.key]
        if (!prop) {
          return rpc.write({error: Error.MALFORMED})
        }
        switch (req.key) {
          case 'username': {
            let offset = rand(1, 5)
            user.username = userProps.username(req.value) || req.userId.substr(2 + offset, 18 + offset).toLowerCase()
            break
          }
          default: {
            return rpc.write({error: Error.MALFORMED})
          }
        }

        await user.save()
        break
      }
      case OP.DEL: {
        if (user.username) { await user.delete() } // q'n'd check if user is defined and delete if it is
        break
      }
      default: {
        return rpc.write({error: Error.MALFORMED})
      }
    }
  } else {
    // const settings = main.settings
    switch (req.type) {
      case OP.SET: {
        switch (req.key) {
          default: {
            return rpc.write({error: Error.MALFORMED})
          }
        }

        /* await settings.save()
        break */
      }
      default: {
        return rpc.write({error: Error.MALFORMED})
      }
    }
  }

  return rpc.write({})
})
