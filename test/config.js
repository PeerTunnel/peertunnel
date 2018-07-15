'use strict'

/* eslint-env mocha */

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const fs = require('fs')

it('should generate a proper config', function (done) {
  this.timeout(30 * 1000)

  process.env.GENCONF = '1'
  process.env.CONFIG = '/tmp/peertunnel.test.json'

  try {
    fs.unlinkSync(process.env.CONFIG)
  } catch (e) {
    // nothing todo
  }

  require('../src/server/bin')

  const next = () => {
    const contents = JSON.parse(String(fs.readFileSync(process.env.CONFIG)))
    expect(contents).to.exist()
    expect(contents.id).to.exist()
    expect(contents.storage).to.equal(process.cwd())
    expect(contents.admins[0]).to.equal('QmYourId')
    expect(contents.publicAddr).to.equal('/ip4/0.0.0.0/tcp/443')
    expect(contents.zone).to.equal('peertunnel.example.com')

    done()
  }

  const intv = setInterval(() => {
    if (fs.existsSync(process.env.CONFIG)) {
      clearInterval(intv)
      next()
    }
  }, 1000)
})
