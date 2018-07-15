'use strict'

/* eslint-env mocha */

describe('peertunnel', () => {
  describe('server', () => {
    describe('config', () => {
      require('./config')
    })
  })

  describe('client', () => {
    describe('tunnel', () => {
      require('./tunnel')
    })

    describe('admin', () => {
      require('./admin')
    })
  })

  describe('cli', () => {

  })
})
