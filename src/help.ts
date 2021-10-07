export default function help() {
  console.log(`Connect to a socket.io server

Usage:
  socketio <url>
  
Options:
    --help, -h  Show help
    --version, -v  Show version
`)
  process.exit(0)
}
