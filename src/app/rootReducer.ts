import { combineReducers } from '@reduxjs/toolkit'
import { accountReducer } from '../features/account/accountSlice'

const rootReducer = combineReducers({ account: accountReducer })

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
