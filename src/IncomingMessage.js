import { Readable } from 'stream'

class IncomingMessage extends Readable {
  body = { }
  cookies = { }
  hostname = ""
  ip = ""
  originUrl = ""
}
