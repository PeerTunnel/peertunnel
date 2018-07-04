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

module.exports = function AdminRPC (pi, admins, main) {
  const shake = handshake()

  const rpc = RPC(shake.handshake, AdminRequest, AdminResponse)
  if (admins.indexOf(pi.id.toB58String()) === -1) {
    log('admin rpc: UNAUTHORIZED ACCESS BY %s', pi.id.toB58String())
    return rpc.write({error: Error.NOT_AUTHORIZED})
  }
  rpc.read(async (err, req) => {
    if (err) { return log(err) }
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
            switch (req.key) {
              case 'cert':
              case 'key':
                main.cert[req.key] = req.value
                if (main.cert.cert && main.cert.key) { // eslint-disable-line
                  await main.cert.save()
                }
                break
              default: {
                return rpc.write({error: Error.MALFORMED})
              }
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
      log(e)
      return rpc.write({error: Error.OTHER})
    }
  })

  return shake
}
