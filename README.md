# Socket.io CLI

![npm](https://img.shields.io/npm/v/socket.io-cli)
![npm](https://img.shields.io/npm/dm/socket.io-cli)
![npm](https://img.shields.io/npm/l/socket.io-cli)

I often use `python -m websockets <url>` to connect to and test a web sockets server when developing.
However, this doesn't work for Socket.io, so I've created a cli that should hopefully serve as a substitute.

## Installation

```bash
# npm
npm i -g socket.io-cli
# yarn
yarn global add socket.io-cli
```

## Usage

You can run the cli with `socketio`.

> Aliases: `socket-io`, `socketio-cli`

```bash
socketio <url>
```

When sending a socket.io event, you send an event name, and some data.
In this cli, the first argument is the event, and any following arguments are treated as data.

```bash
# my_event data1 data2 etc
```

Since everything is seperated by spaces, you can wrap your event name or data in "quotes" if you need to include any spaces.
These quotes are then removed before sending the data.

```
# "My event" "{'message': 'hi'}"
```

## Contributing

Pull requests are welcome.
For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
