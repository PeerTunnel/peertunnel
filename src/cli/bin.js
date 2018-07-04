#!/usr/bin/env node

'use strict'

const yargs = require('yargs')

yargs // eslint-disable-line
  .commandDir('commands')
  .argv
