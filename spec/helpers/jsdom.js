import { JSDOM } from 'jsdom'

const dom = new JSDOM('<html><body></body></html>')

global.document = dom.window.document
global.window = dom.window
global.navigator = dom.window.navigator
global.HTMLElement = window.HTMLElement
global.localStorage = {
  getItem: function (key) {
    const value = this[key]
    return typeof value === 'undefined' ? null : value
  },
  setItem: function (key, value) {
    this[key] = value
  },
  removeItem: function (key) {
    return delete this[key]
  },
}
