import {ADD_SEND} from './emit-types'

const send = function (url, data){
  this.socket.emit(ADD_SEND, {url, data});
};

export {
  send
}