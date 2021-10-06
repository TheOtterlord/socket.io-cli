#!/usr/bin/env node

const readline = require("readline")
const path = require('path')
const arg = require('arg')
const io = require('socket.io-client')

let socket, rl

let historyIndex = -1

const lineHistory = []

const UP = Buffer.from([0x1b, 0x5b, 0x41])
const DOWN = Buffer.from([0x1b, 0x5b, 0x42])

function checkHistory(b) {
  let oldIndex = historyIndex
  if (b.equals(UP)) historyIndex = Math.min(lineHistory.length - 1, historyIndex + 1)
  else if (b.equals(DOWN)) historyIndex = Math.max(-1, historyIndex - 1)
  else return
  if (oldIndex === historyIndex) return
  // console.log(oldIndex, historyIndex)
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  process.stdout.write('# ')
  rl.line = ''
  rl.write(`${lineHistory[historyIndex] ?? ''}`)
}

process.stdin.on('data', checkHistory)

function help(config) {
  let text = `Connect to a socket.io server

Usage:
socketio <url>

Options:
  --help, -h  Show help
  --version, -v  Show version
`
  console.log(text)
  process.exit(0)
}

function main() {
  const config = arg({
    '--help': Boolean,
    '--version': Boolean,

    '-h': '--help',
    '-v': '--version'
  })

  if (config['--version']) {
    console.log(`v${require(path.join(__dirname, '../package.json')).version}`)
    process.exit(0)
  }
  if (config['--help']) return help(config)
  if (config._.length !== 1) return help(config)

  socket = io(config._[0])

  socket.on('connect', () => {
    console.log(`Connected to ${config._[0]}`)
    prompt()
  })
  socket.on('connect_error', (err) => console.log('Connection error: ', err))
  socket.on('disconnect', (reason) => console.log(`Disconnected from ${config._[0]}: ${reason}`))
  socket.onAny((event, ...args) => {
    const input = rl.line
    // rl.input.off('data', checkHistory)
    rl.close()
    console.log(`\r${event} ${JSON.stringify(args)}`)
    prompt()
    rl.write(input)
  })
}

function prompt() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: line => {
      const completions = lineHistory.filter(l => l.startsWith(line))
      return [completions, line]
    }
  })

  rl.question('# ', (line) => {
    lineHistory.unshift(line)
    historyIndex = -1

    let args = []
    let arg = ''

    let isString = false
    let isObject = false
    while (line.length > 0) {
      const c = line[0]
      line = line.substr(1)
      if (c === ' ' && !isString && !isObject) {
        args.push(arg)
        arg = ''
      }else if (isString && c === '\"') isString = false
      else if (!isString && c === '\"') isString = true
      else arg += c
    }
    if (arg.length > 0) args.push(arg)
    // console.log(args)
    let event = args.shift()
    socket.emit(event, ...args)
    rl.close()
    prompt()
  })
}

main()
