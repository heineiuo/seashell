import defaults from 'lodash/defaults'

const parseBuffer = (e) => {
  const t1 = Date.now();
  const indexOfSeparator = e.indexOf(':')
  const headerByteLength = Number(e.slice(0, indexOfSeparator))
  const indexOfHeaderStart = indexOfSeparator + 1
  const indexOfHeaderEnd = indexOfHeaderStart + headerByteLength
  const headersText = e.slice(indexOfHeaderStart, indexOfHeaderEnd).toString()
  const headers = JSON.parse(headersText)
  const {bodyType} = headers
  const bodyText = bodyType === 'json' ? e.slice(indexOfHeaderEnd).toString() : '{}'
  const body = bodyType === 'json' ? JSON.parse(bodyText) : bodyText
  console.log(`parseBuffer: spend time ${Date.now() - t1}ms`)
  return {headers, body}
}

const buildBuffer = (header, body) => {
  const t1 = Date.now();
  const {bodyType} = header;
  const headerBuf = Buffer.from(JSON.stringify(header))
  const bodyBuf = bodyType === 'json' ? Buffer.from(JSON.stringify(body)) :
      bodyType === 'buffer' ? body : Buffer.from([0])
  const len = Buffer.from(`${headerBuf.length}:`)
  const mergeBuffer = Buffer.concat([
    len,
    headerBuf,
    bodyBuf
  ])
  console.log(`buildBuffer: spend time ${Date.now() - t1}ms`)
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
