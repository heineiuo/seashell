import defaults from 'lodash/defaults'

const parseBuffer = (e) => {
  const str = e.toString()
  const bufLen = e.slice(0, 1).toJSON().data[0]
  const headers = e.slice(1, bufLen + 1).toString()
  const headerJSON = JSON.parse(headers)
  const {bodyType} = headerJSON
  const body = bodyType === 'json' ? e.slice(bufLen + 1).toString() : 'other'
  return {headers, body}
}

const buildBuffer = (header, body) => {
  const {bodyType} = header;
  const headerBuf = new Buffer.from(JSON.stringify(header))
  const bodyBuf = bodyType === 'json' ? new Buffer.from(JSON.stringify(body)) :
      bodyType === 'buffer' ? body : new Buffer.from([0])
  const len = new Buffer.from([headerBuf.length])
  const mergeBuffer = Buffer.concat([
    len,
    headerBuf,
    bodyBuf
  ])

  return mergeBuffer
}

const clearUnsafeHeaders = (req) => {
  const {headers, body} = req
  defaults(headers, {bodyType: 'json'})
  return buildBuffer(headers, body)
};

export {
  parseBuffer,
  buildBuffer,
  clearUnsafeHeaders
}
