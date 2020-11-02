export function chunk(str: string, size: number) {
  const R: Array<string> = []
  for (let i = 0; i < str.length; i += size) {
    R.push(str.slice(i, i + size))
  }
  return R
}
