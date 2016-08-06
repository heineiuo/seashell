class Base {

  setState = (nextState)=>{
    this.state = Object.assign({}, this.state, nextState)
  }

}

export default Base
