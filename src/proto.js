'use strict'

const protons = require('protons')

const P = module.exports = protons(`

enum Error {
  OK             = 0;
  NOT_AUTHORIZED = 1;
  TUNNEL_MISSING = 2; // when server sends connection request for non-existent tunnel
  CONN_ESTABLISH = 3; // basically a "catch all" for TCP connection errors
  MALFORMED      = 4; // request was malformed
  OTHER          = 9; // internal server error
}


message Tunnel {
  required string id   = 1;
  string forwardSecret = 2;
  string address       = 3; // hostname only, https://HOSTNAME
}

message Remote {
  string ip  = 1;
  int64 port = 2;
}


message OpenRequest {
  string suffix = 1;
}

message OpenResponse {
  Error error = 1;
  optional Tunnel tunnel = 2;
}


message ForwardRequest {
  Tunnel tunnel = 1;
  Remote remote = 2;
}

message ForwardResponse {
  Error error = 1;
}

`)

P.ETABLE = {
  [P.Error.OK]: 'OK',
  [P.Error.NOT_AUTHORIZED]: 'Not authorized',
  [P.Error.TUNNEL_MISSING]: 'Remote requested a connection establish for non-existent tunnel',
  [P.Error.CONN_ESTABLISH]: 'The remote destination could not be reached',
  [P.Error.MALFORMED]: 'The request was malformed',
  [P.Error.OTHER]: 'An unknown error occured'
}
