import defaults from 'lodash.defaults'

class Base {

  setState = (nextState)=>{
    this.state = defaults(nextState, this.state)
  }

}

export default Base