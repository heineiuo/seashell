import Emitter from 'events'
import {I_HAVE_HANDLE_THIS_REQUEST} from './emit-types'
import * as log from './log'
import {clearUnsafeHeaders} from './clearUnsafeHeaders'

class Context extends Emitter {
  constructor(socket, req){
    super();
    this.socket = socket;
    this.request = req;
    if (!req.hasOwnProperty('params')) this.request.params = {};
    this.response = {
      headers: req.headers,
      body: {},
      end: () => {
        if (this.state.isHandled) throw new Error('ctx.response.end has been called!');
        this.state.isHandled = true;
        socket.send(clearUnsafeHeaders({
          headers: {...this.response.headers, type: 'I_HAVE_HANDLE_THIS_REQUEST'},
          body: this.response.body
        }));
        this.emit('end');
      }
    };
  }

  state = {
    isHandled: false
  };
}

export {
  Context
}
