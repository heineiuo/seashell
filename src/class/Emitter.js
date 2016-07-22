class Emitter {
  state = {}

  on = (eventName, callback) => {
    if (typeof callback === 'function') {
      return this.state[eventName] = callback
    }
  }

  emit = (eventName, data) => {
    if (typeof this.state[eventName] === 'function'){
      this.state[eventName](data)
    }
  }
}

export default Emitter