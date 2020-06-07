/* eslint-disable no-undef */

console.log('fetch in module2')
console.log(fetch)
console.log('isFrozen fetch', Object.isFrozen(fetch))
console.log('isFrozen fetch proto', Object.isFrozen(fetch.__proto__))

export function printFetch() {
  console.log('fetch in module2 function')
  console.log(fetch)
  console.log('isFrozen fetch', Object.isFrozen(fetch))
  console.log('isFrozen fetch proto', Object.isFrozen(fetch.__proto__))
}