import defaults from 'lodash/defaults'
import {Buffer} from 'buffer'

const parseBuffer = (e) => {
  const indexOfSeparator = e.indexOf(':')
  const headerByteLength = Number(e.slice(0, indexOfSeparator))
  const indexOfHeaderStart = indexOfSeparator + 1
  const indexOfHeaderEnd = indexOfHeaderStart + headerByteLength
  const headersText = e.slice(indexOfHeaderStart, indexOfHeaderEnd).toString()
  const headers = JSON.parse(headersText)
  const {bodyType} = headers
  const bodyText = bodyType === 'json' ? e.slice(indexOfHeaderEnd).toString() : '{}'
  const body = bodyType === 'json' ? JSON.parse(bodyText) : bodyText
  return {headers, body}
}

const buildBuffer = (header, body) => {
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
