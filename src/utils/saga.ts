import { createAction, createReducer } from '@reduxjs/toolkit'
import { call, delay, put, race, take } from 'redux-saga/effects'
import { logger } from './logger'

/**
 * A convinence utility to create a saga and trigger action
 * Use to create simple sagas, for more complex ones use createMonitoredSaga.
 * Note: the wrapped saga this returns must be added to rootSaga.ts
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

export enum SagaStatus {
  Started = 'started',
  Success = 'success',
  Failure = 'failure',
}

export enum SagaError {
  Exception = 'exception',
  Failure = 'failure',
  Timeout = 'timeout',
  Cancel = 'cancel',
}

export interface SagaState {
  status: SagaStatus | null
  error: SagaError | string | number | null // error details such as type or error code
}

interface MonitoredSagaOptions {
  timeoutDuration?: number // in milliseconds
  // TODO add retry option
}

/**
 * A convinence utility to create a wrapped saga that handles common concerns like
 * triger watching, cancel watching, timeout, progress updates, and success/fail updates.
 * Use to create complex sagas that need more coordination with the UI.
 * Note: the wrapped saga and reducer this returns must be added to rootSaga.ts
 */
export function createMonitoredSaga<SagaParams = void>(
  saga: (...args: any[]) => any,
  name: string,
  options?: MonitoredSagaOptions
) {
  const triggerAction = createAction<SagaParams>(`${name}/trigger`)
  const cancelAction = createAction<void>(`${name}/cancel`)
  const statusAction = createAction<SagaStatus>(`${name}/progress`)
  const errorAction = createAction<string>(`${name}/error`)

  const reducer = createReducer<SagaState>({ status: null, error: null }, (builder) =>
    builder
      .addCase(statusAction, (state, action) => {
        state.status = action.payload
        state.error = null
      })
      .addCase(errorAction, (state, action) => {
        state.status = SagaStatus.Failure
        state.error = action.payload
      })
  )

  const wrappedSaga = function* () {
    while (true) {
      try {
        const trigger = yield take(triggerAction.type)
        logger.debug(`${name} triggered`)
        yield put(statusAction(SagaStatus.Started))
        const { result, cancel, timeout } = yield race({
          // TODO Use fork here instead if parallelism is required for the saga
          result: call(saga, trigger.payload, statusAction),
          cancel: take(cancelAction.type),
          timeout: delay(options?.timeoutDuration || DEFAULT_TIMEOUT),
        })

        if (cancel) {
          logger.debug(`${name} canceled`)
          yield put(errorAction(SagaError.Cancel))
          continue
        }

        if (timeout) {
          logger.warn(`${name} timed out`)
          yield put(errorAction(SagaError.Timeout))
          continue
        }

        if (result === false) {
          logger.warn(`${name} returned failure result`)
          yield put(errorAction(SagaError.Failure))
          continue
        }

        yield put(statusAction(SagaStatus.Success))
      } catch (error) {
        logger.error(`${name} error`, error)
        yield put(errorAction(SagaError.Exception))
      }
    }
  }

  return {
    wrappedSaga,
    reducer,
    actions: {
      trigger: triggerAction,
      cancel: cancelAction,
      progress: statusAction,
      error: errorAction,
    },
  }
}