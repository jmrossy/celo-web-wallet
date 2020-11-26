interface Sliceable {
  length: number
  slice: (i: number, j: number) => any
}

export function chunk<T extends Sliceable>(str: T, size: number) {
  const R: Array<T> = []
  for (let i = 0; i < str.length; i += size) {
    R.push(str.slice(i, i + size))
  }
  return R
}
