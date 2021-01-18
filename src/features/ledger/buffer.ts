// @ts-ignore
import buffer from 'buffer'

const _global = window as any
if (!_global.Buffer) {
  _global.Buffer = buffer.Buffer
}
