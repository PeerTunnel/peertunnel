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

### Examples:

`/tcp/.port/443/ssl/.hostname/example.com/http/.path/"service/"/_ws/stream/` => `/ip4/127.0.0.1/tcp/8091`

- Match incomming TCP connections on port 443
- Match incomming SSL traffic with SNI-hostname `example.com`
- Next action is another protocol so implictly call `.stream()` causing an SSL handshake to be done
- Match incomming HTTP traffic on path `service/` which also matches websocket traffic
- Explict `.stream()` call causing only the websocket traffic itself, not the HTTP-Upgrade headers to be sent to the client
- Relay that traffic to `/ip4/127.0.0.1/tcp/8091`

tl;dr `wss://example.com/service` => `tcp://localhost:8091`

`/tcp/.port/5235/ssh/` => `/ip4/127.0.0.1/tcp/22`

- Match incomming TCP connections on port 5235
- Match incomming SSH traffic
- Implict `/forward` causing raw SSH traffic to be sent to client

tl;dr `ssh://example.com:5235` => `ssh://localhost`
