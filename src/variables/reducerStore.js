import { configureStore } from '@reduxjs/toolkit'
import errorReducer from './errorSlice'
import toastSlice from './toastSlice'

const toastReducer = toastSlice;
const store = configureStore({
  reducer: {
    errors: errorReducer,
    toasts: toastReducer

  }
})

export default store
