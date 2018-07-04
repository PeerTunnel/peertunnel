# peertunnel

Make your `localhost` public behind SSL/TLS!

> # WIP

## How

The protocol is simple.

First the client connects to the server and the server checks if it's authorized.
Then the client sends a request to open a tunnel.
The tunnel is now open!

When a remote-client connects, the server simply forwards the connection to the remote client based on the TLS hostname.

## Setup

### Client

First install and setup the peertunnel CLI _(WIP)_

```sh
npm i -g peertunnel
peertunnel init
```

Then find a remote server and get authorized on it somehow

```sh
peertunnel servers add /address/of/server "some-server" # first server will be remembered as default, change using `peertunnel servers set-default "name"`
```

Now you can open tunnels

```sh
peertunnel tunnel --suffix hello-world --port 3000
```

### Server

> WIP


## ToDos

- [ ] Make it work
  - [ ] Server
  - [ ] Client
    - [ ] User CMDs
    - [ ] Admin CMDs
  - [ ] Tests
- [ ] Add bandwith quotas
- [ ] Use DIDs for Auth
- [ ] Use peer-star / orbitdb / other storage for a replicated p2p db
- [ ] Add load-balancing
