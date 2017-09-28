import FormData from 'form-data'
import Bofy from './Body'

/**
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Request/Request
 */
class Request extends Body {
  constructor (input, init) {
    super()
    this.url = input
    this.method = init.method
    //...
  }

  clone = () => {}
  
}
