# PeerTunnel v2

## "Dissectors"

WireShark-inspired dissectors

> WIP

## Forward Addresses

A forward address is a multiaddrs-inspired address format that can express protocols and conditions that must be true as well as actions that must be taken if the conditions match in order to relay a connection

It consists of the following components:
- Protocols `/proto`

  These indicate which protocol to match. The protocol is first detected using the `.detect()` function, then the conditions are matched

- Subprotocols `/_proto`

  These are subprotocols and are a special case of dissectors as their values are directly given as arguments to the detect function of the protocol

- Conditions `/.key/VALUE`

  A key/value condition that must match
  Optionally a custom matching algorithm can be specified using `/.key:MATCH/VALUE` where `MATCH` can be one of `re/regex,st/strict,host,ip/address,port`

- Actions `/forward` or `/stream`

  These tell peertunnel what to do with the data. The `.stream()` function, if supported by the protocol, returns a new stream that other matches can take place upon

  Forward simply streams the data as-is to the client

Examples:

> WIP
