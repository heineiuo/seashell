import { Writeable } from 'stream'

class ServerResponse extends Writeable {

  /**
   * properties
   */
  app = null
  headersSent = false
  locals = {}

  /**
   * method
   */
  append = () => { }
  attachment = () => { }
  cookie = () => { }
  clearCookie = () => { }
  download = () => { }
  end = () => { }
  format = () => { }
  get = () => { }
  json = () => { }
  jsonp = () => { }
  links = () => { }
  location = () => { }
  redirect = () => { }
  render = () => { }
  send = () => { }
  sendFile = () => { }
  sendStatus = () => { }
  set = () => { }
  status = () => { }
  write = () => { }

  /**
   * nodejs ServerResponse
   */
  setHeader = () => { }
  writeHead = () => { }
  socket = {}
}
