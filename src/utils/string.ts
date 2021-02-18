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

export function trimToLength(value: string, maxLength: number) {
  if (!value) return ''
  const trimmed = value.trim()
  return trimmed.length > maxLength ? trimmed.substring(0, maxLength) + '...' : trimmed
}
