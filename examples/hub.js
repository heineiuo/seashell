import { Hub } from '../src'
import fs from 'fs'

const hub = new Hub()
const config = JSON.parse(fs.readFileSync('./data/config/config.json'))

hub.start(config)
