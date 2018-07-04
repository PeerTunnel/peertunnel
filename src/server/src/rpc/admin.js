'use strict'

const handshake = require('pull-handshake')
const RPC = require('../../../common/rpc')
const {AdminRequest, AdminResponse, OP, Error} = require('../../../common/proto')
const assert = require('assert')
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const debug = require('debug')
const log = debug('peertunnel:server:admin-rpc')

const userProps = {
  username: (buf) => {
    buf = String(buf)
    assert('must be 16 or less chars', buf.length > 16)
    assert('must be lowercase alphanum', buf.match(/^[a-z0-9]$/))
    return buf
  }
}

const adminProps = {

}

module.exports = function AdminRPC (pi, admins, main) {
  const shake = handshake().handshake

  const rpc = RPC(shake.handshake, AdminRequest, AdminResponse)
  if (admins.indexOf(pi.id.toB58String()) !== -1) {
    return rpc.write({error: Error.NOT_AUTHORIZED})
  }
  rpc.read(async (req) => {
    try {
      log('admin rpc %s %s %s on %s', req.type, req.key, req.value, req.userId || '<GLOBAL>')
      if (req.userId) {
        const user = await main.storage.getUser(req.userId)
        switch (req.type) {
          case OP.ADD: {
            let offset = rand(1, 5)
            user.username = req.userId.substr(2 + offset, 18 + offset).toLowerCase()
            break
          }
          case OP.SET: {
            const prop = userProps[req.key]
            if (!prop) {
              return rpc.write({error: Error.MALFORMED})
            }
            if (!req.value) {
              delete user[req.key]
            } else {
              user[req.key] = prop(req.value)
            }

            await user.save()
            break
          }
          case OP.DEL: {
            break
          }
          default: {
            return rpc.write({error: Error.MALFORMED})
          }
        }
      } else {
        const settings = main.settings
        switch (req.type) {
          case OP.SET: {
            const prop = adminProps[req.key]
            if (!prop) {
              return rpc.write({error: Error.MALFORMED})
            }
            if (!req.value) {
              delete settings[req.key]
            } else {
              settings[req.key] = prop(req.value)
            }

            await settings.save()
            break
          }
          default: {
            return rpc.write({error: Error.MALFORMED})
          }
        }
      }

      return rpc.write({})
    } catch (e) {
      return rpc.write({error: Error.OTHER})
    }
  })

  return shake
}
