/* eslint-disable no-undef */
import "ses";
import {printFetch} from "./module2"

lockdown();
console.log(this)
console.log(global)
console.log(globalThis)
harden(globalThis)

const c = new Compartment({
    print: harden(console.log),
});

c.evaluate(`
print("Hello! Hello?");
fetch = {'foo': 'bar'}
print(fetch)
`);

console.log('isFrozen arr', Object.isFrozen([].__proto__))
console.log('isFrozen console', Object.isFrozen(console))
console.log('isFrozen console proto', Object.isFrozen(console.__proto__))

// console = {'foo': 'bar'}
console.log(fetch)
console.log('isFrozen fetch', Object.isFrozen(fetch))
console.log('isFrozen fetch proto', Object.isFrozen(fetch.__proto__))
fetch.foo = 'foobar'
harden(fetch)
console.log('isFrozen fetch after harden', Object.isFrozen(fetch))
console.log('isFrozen fetch proto after harden', Object.isFrozen(fetch.__proto__))
fetch = {'foo': 'bar'}
console.log('isFrozen fetch after reassignment', Object.isFrozen(fetch))
console.log('isFrozen fetch proto after reassignment', Object.isFrozen(fetch.__proto__))

c.evaluate(`
    print(fetch)
    class keys {
      constructor() {
        this.key = 'sdkfjswi3jisw'
      }
      getKeys() {
        print(this.key)
      }
    }
    const key = new keys()
    this.key2 = new keys()
`);

c.evaluate(`
    this.key2.getKeys()
`);

printFetch()