import readline, { ReadLine } from 'readline'
import App from '.'

const UP = Buffer.from([0x1b, 0x5b, 0x41])
const DOWN = Buffer.from([0x1b, 0x5b, 0x42])

export default class Prompt {
  app: App

  history: string[] = []
  position = -1
  rl: ReadLine | undefined

  constructor(app: App) {
    this.app = app
    process.stdin.on('data', (data: Buffer) => this.oninput(data))
  }

  ask() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line: string) => {
        const completions = this.history.filter(l => l.startsWith(line))
        return [completions, line]
      }
    })

    this.rl.question('# ', (line: string) => {
      this.history.unshift(line)
      this.position = -1
  
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
      if (args.length === 0) return this.ask()
      let event = args.shift()!
      this.app.socket?.emit(event, ...args)
      this.rl?.close()
      this.ask()
    })
  }

  log() {}

  oninput(data: Buffer) {
    if (!this.rl) return
    let oldPos = this.position
    if (data.equals(UP)) this.position = Math.min(this.history.length - 1, this.position + 1)
    else if (data.equals(DOWN)) this.position = Math.max(-1, this.position - 1)
    else return
    if (oldPos === this.position) return
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write('# ')
    // this.rl.line = ''
    this.rl?.write(`${this.history[this.position] ?? ''}`)
  }
}
