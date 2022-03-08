global.__DEBUG__ = true
global.__IS_ELECTRON__ = false
global.__VERSION__ = '1.0.0'
global.__ALCHEMY_KEY__ = 'fakeKey'
global.__WALLET_CONNECT_KEY__ = 'fakeKey'
global.fetch = require('node-fetch')

var localStorage = {}
localStorage.setItem = function (key, val) {
  this[key] = val + ''
}
localStorage.getItem = function (key) {
  return this[key]
}
Object.defineProperty(localStorage, 'length', {
  get: function () {
    return Object.keys(this).length - 2
  },
})
global.localStorage = localStorage
global.navigator = {}
