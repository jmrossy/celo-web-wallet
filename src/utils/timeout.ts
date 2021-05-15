import { CallEffect } from '@redux-saga/core/effects'
import { delay, race } from 'typed-redux-saga'

// Using requires 'raw' call effects because of issue:
// https://github.com/agiledigital/typed-redux-saga/issues/43
export function* withTimeout<T>(effect: CallEffect<T>, ms: number, errorMsg: string) {
  const { result, timeout } = yield* race({
    result: effect,
    timeout: delay(ms),
  })
  if (!result || timeout) {
    throw new Error(errorMsg)
  }
  return result
}
