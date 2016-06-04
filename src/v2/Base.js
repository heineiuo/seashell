import defaults from 'lodash.defaults'

class Base {
  private state = {

  }

  private setState = (nextState)=>{
    this.state = defaults(nextState, this.state)
  }

}

export default Base