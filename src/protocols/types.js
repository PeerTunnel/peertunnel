'use strict'

module.exports = {
  types: {
    string: {
      parse: String,
      match: 'strict'
    },
    number: {
      parse: (value) => {
        value = parseInt(String(value), 10)
        if (isNaN(value)) return null
        return value
      }
    },
    hostname: {
      parse: String,
      match: 'glob'
    }
  },
  matchers: {
    strict: (value, compareTo) => value === compareTo,
    regex: (value, compareTo) => Boolean(new RegExp(compareTo).exec(value)),
    glob: (value, comparseTo) => {} // TODO: add
  }
}
