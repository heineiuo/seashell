import SocketIO from 'socket.io'
import {integrate} from './integrate'
import {register} from './register'
import {onConnection} from './onConnection'
import {onSend} from './onSend'
import {onRequest} from './onRequest'
import {onResponse} from './onResponse'
import {onDisconnect} from './onDisconnect'
import {requestIntegration} from './requestIntegration'

class Seashell {

  constructor () {
    this.io = new SocketIO();
    this.io.on('connection', this.onConnection);
  }

  integrationEmitterStack = {};
  integrations = {};
  integrate = integrate.bind(this);
  requestIntegration = requestIntegration.bind(this);
  register = register.bind(this);
  onConnection = onConnection.bind(this);
  onSend = onSend.bind(this);
  onRequest = onRequest.bind(this);
  onResponse = onResponse.bind(this);
  onDisconnect = onDisconnect.bind(this);

}

export default Seashell