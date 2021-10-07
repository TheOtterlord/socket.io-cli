#!/usr/bin/env node

import arg from 'arg'
import path from 'path'
import io, { Socket } from 'socket.io-client'
import help from './help'
import Prompt from './prompt'

export default class App {
  socket: Socket | undefined
  prompt: Prompt

  constructor() {
    this.prompt = new Prompt(this)
  }

  start() {
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
    if (config['--help']) return help()
    if (config._.length !== 1) return help()

    this.socket = io(config._[0])

    this.socket.on('connect', () => {
      console.log(`Connected to ${config._[0]}`)
      this.prompt.ask()
    })
    this.socket.on('connect_error', (err) => console.log('Connection error: ', err))
    this.socket.on('disconnect', (reason) => console.log(`Disconnected from ${config._[0]}: ${reason}`))
    this.socket.onAny((event, ...args) => {
      const input = this.prompt.rl?.line ?? ''
      this.prompt.rl?.close()
      console.log(`\r${event} ${JSON.stringify(args)}`)
      this.prompt.ask()
      this.prompt.rl?.write(input)
    })
  }
}
