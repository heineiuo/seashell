import fetch from 'node-fetch'
import UrlEncode from "form-urlencoded"

class Fetch {
  constructor(url, params = {}) {
    this.url = url;
    this.params = params;
    this.options = {}
  }

  formData = (formData) => {
    this.formData = formData;
    this.bodyType = 'FormData'
    return this;
  }

  fetch = (method = 'POST') => new Promise(async (resolve, reject) => {
    let text = null;
    try {
      this.options.headers = this.options.headers || {}
      this.options.method = method.toUpperCase();

      if (this.bodyType === 'FormData') {
        const sepCode = this.url.search(/\?/) > 0 ? '&' : '?'
        this.url = `${this.url}${sepCode}${UrlEncode(this.params, {
          ignorenull : true,
          sorted : true
        })}`
        if (this.options.method === 'GET') return resolve({error: 'Form data must use POST method'})
        this.options.body = this.formData
      } else {
        this.options.headers["Content-Type"] = "application/json"
        this.options.body = JSON.stringify(this.params)
      }
      const res = await fetch(this.url, this.options)
      text = await res.text()
      const json = JSON.parse(text)
      resolve(json)
    } catch (e) {
      console.log(
        `
Server response is not JSON format, please check: 
${text}
`
      )
      resolve({error: e})
    }
  })

  post = () => this.fetch('POST')
  get = () => this.fetch('GET')
}

export {UrlEncode}
export default (...props) => new Fetch(...props)

