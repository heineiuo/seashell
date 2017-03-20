/**
 * 1. 或许Seashell可以继承App, App1通过Seashell请求App2时，Seashell会作为中转用途的App去请求App2,
 * 相当于Seashell这个App提供了两个接口，1是接收请求并转发请求，2是接收返回并转发返回
 * 注意，Seashell在请求App2时，考虑到Seashell知道App2正在「连着自己」，所以Seashell直接给App2发请求
 * 当Seashell发现App2不连着自己时，Seashell可以查看自己连接着的其他Seashell2，并将发送请求给Seashell2
 *
 * 2. Seashell维护作为App的状态，也维护作为Seashell，对App进行管理的状态。
 *
 * 3. 可以理解为App之间是父子关系，作为父即Seashell，可以接受子请求，转发给子，
 * 作为子即App，处理请求，返回数据
 *
 */

import SocketIO from 'socket.io'
import {integrate} from './integrate'
import {register} from './register'
import {onConnection} from './onConnection'
import {onSend} from './onSend'
import {onRequest} from './onRequest'
import {onResponse} from './onResponse'
import {onDisconnect} from './onDisconnect'
import {proxyIntegration} from './proxyIntegration'
import {requestIntegration} from './requestIntegration'
import App from './App/App'

class Seashell extends App {

  constructor () {
    super();
    this.io = new SocketIO();
    this.io.on('connection', this.onConnection);
  }

  integrationEmitterStack = {};
  integrations = {};
  integrate = integrate.bind(this);
  requestIntegration = requestIntegration.bind(this);
  proxyIntegration = proxyIntegration.bind(this);
  register = register.bind(this);
  onConnection = onConnection.bind(this);
  onSend = onSend.bind(this);
  onRequest = onRequest.bind(this);
  onResponse = onResponse.bind(this);
  onDisconnect = onDisconnect.bind(this);

}

export default Seashell