import { createAction, createReducer } from '@reduxjs/toolkit'
import { call, delay, put, race, take } from 'redux-saga/effects'
import { logger } from './logger'

/**
 * A convinence utility to create a saga and trigger action
 * Use to create simple sagas, for more complex ones use createMonitoredSaga
 * @param saga the worker saga that will be wrapped
 */
export function createSaga<SagaParams = void>(saga: (...args: any[]) => any, name: string) {
  const triggerAction = createAction<SagaParams>(`${name}/trigger`)

  const wrappedSaga = function* () {
    while (true) {
      try {
        const trigger = yield take(triggerAction.type)
        logger.debug(`${name} triggered`)
        yield call(saga, trigger.payload)
      } catch (error) {
        logger.error(`${name} error`, error)
      }
    }
  }

  return {
    wrappedSaga,
    actions: {
      trigger: triggerAction,
    },
  }
}

const DEFAULT_TIMEOUT = 60 * 1000 // 1 minute

export enum DefaultProgressStates {
  Started = 'started',
  Success = 'success',
  Failure = 'failure',
}

export enum DefaultErrorStates {
  Exception = 'exception',
  Failure = 'failure',
  Timeout = 'timeout',
  Cancel = 'cancel',
}

export interface DefaultSagaState {
  progress: string | null
  error: string | null
}

interface MonitoredSagaOptions {
  name: string
  timeoutDuration?: number // in milliseconds
  // TODO add retry option
}

/**
 * A convinence utility to create a wrapped saga that handles common concerns like
 * triger watching, cancel watching, timeout, progress updates, and success/fail updates.
 * Use to create complex, risky, or long-lived sagas
 * @param saga the worker saga that will be wrapped
 * @param options configurations for the wrapper
 */
export function createMonitoredSaga<SagaParams = void>(
  saga: (...args: any[]) => any,
  options: MonitoredSagaOptions
) {
  const { name, timeoutDuration } = options
  const triggerAction = createAction<SagaParams>(`${name}/trigger`)
  const cancelAction = createAction<void>(`${name}/cancel`)
  const progressAction = createAction<string>(`${name}/progress`)
  const errorAction = createAction<string>(`${name}/error`)

  const reducer = createReducer<DefaultSagaState>({ progress: null, error: null }, (builder) =>
    builder
      .addCase(progressAction, (state, action) => {
        state.progress = action.payload
        state.error = null
      })
      .addCase(errorAction, (state, action) => {
        state.progress = DefaultProgressStates.Failure
        state.error = action.payload
      })
  )

  const wrappedSaga = function* () {
    while (true) {
      try {
        const trigger = yield take(triggerAction.type)
        logger.debug(`${name} triggered`)
        yield put(progressAction(DefaultProgressStates.Started))
        const { result, cancel, timeout } = yield race({
          // TODO Use fork here instead if parallelism is required for the saga
          result: call(saga, trigger.payload, progressAction),
          cancel: take(cancelAction.type),
          timeout: delay(timeoutDuration || DEFAULT_TIMEOUT),
        })

        if (cancel) {
          logger.debug(`${name} canceled`)
          yield put(errorAction(DefaultErrorStates.Cancel))
          continue
        }

        if (timeout) {
          logger.warn(`${name} timed out`)
          yield put(errorAction(DefaultErrorStates.Timeout))
          continue
        }

        if (result === false) {
          logger.warn(`${name} returned failure result`)
          yield put(errorAction(DefaultErrorStates.Failure))
          continue
        }

        yield put(progressAction(DefaultProgressStates.Success))
      } catch (error) {
        logger.error(`${name} error`, error)
        yield put(errorAction(DefaultErrorStates.Exception))
      }
    }
  }

  return {
    wrappedSaga,
    reducer,
    actions: {
      trigger: triggerAction,
      cancel: cancelAction,
      progress: progressAction,
      error: errorAction,
    },
  }
}