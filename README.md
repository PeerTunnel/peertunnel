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

Requirements:
  - A server that is **NOT** running anything on port 443 (that means you can't use this server for hosting other websites and peertunnel at the same time)
  - A domain with wildcard DNS

First install peertunnel

```
npm i -g peertunnel
```

Now cd into the directory you want to store the config in and enter `GENCONF=1 pt-server`.
This will generate a config.json for you.

#### Config

  - `id`: This is the authentication key for the server. Leave it as-is.
  - `storage`: This is the storage directory for the db. Change it if you want to store the db somewhere else (directory will be created if it does not exist yet)
  - `admins`: This is an array with the peer-ids of all admins. You should add your own id here. (Get it with `peertunnel id`)
  - `publicAddr`: This is the address the server will listen on. You can likely leave it as-is.
  - `zone`: This is the domain peertunnel will use. You need to update the DNS entries accordingly (see DNS)

#### DNS

Your DNS-Provider **MUST** support Wildcard DNS.
Set both the A and AAAA records of `peertunnel-domain` to the addresses of your server and then set a CNAME on `*.peertunnel-domain` to `peertunnel-domain` where `peertunnel-domain` is the domain you are using for peertunnel.

#### Launching

After that you can launch your server.

To do so simply cd into the directory you stored the config in and run `pt-server`

If you're using sentry you can simply define `$SENTRY_DSN` before launching and all errors should be reported automatically (Don't forget to report them [here](https://github.com/mkg20001/peertunnel/issues), too)

#### Certificate

**NOTE:** For this step to work your server must be already running!

First install acme.sh if not already installed:

```sh
$ curl https://get.acme.sh | sh
```

Then get a wildcard cert for the domain

```sh
# IMPORTANT: Setup dns provider first, see https://github.com/Neilpang/acme.sh/tree/master/dnsapi for more details
$ acme.sh --issue --dns dns_PROVIDER -d peertunnel.example.com -d *.peertunnel.example.com
```

You now need to add the server to your current machine's peertunnel config and give the peer admin access if you haven't already.

Then install the cert on your server

```sh
$ acme.sh --install-cert -d peertunnel.example.com -d *.peertunnel.example.com --key-file /tmp/peertunnel.key.pem --fullchain-file /tmp/peertunnel.cert.pem --reloadcmd "peertunnel --server YOUR_SERVER admin cert-update /tmp/peertunnel.cert.pem /tmp/peertunnel.key.pem"
```

acme.sh will remember these settings and auto-update your cert. After the certificate setup your site should just work(TM).

## ToDos

- [x] Make it work
  - [x] Server
  - [x] Client
    - [x] User CMDs
    - [x] Admin CMDs
- [ ] Tests
- [ ] Add bandwith quotas
- [ ] Use DIDs for Auth
- [ ] Use peer-star / orbitdb / other storage for a replicated p2p db
- [ ] Add load-balancing
