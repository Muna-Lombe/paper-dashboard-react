import { configureStore } from '@reduxjs/toolkit'
import errorReducer from './errorSlice'
import toastSlice from './toastSlice'
import basenameSlice from './basenameSlice';

const toastReducer = toastSlice;
const store = configureStore({
  reducer: {
    errors: errorReducer,
    toasts: toastReducer,
    basenames: basenameSlice

  }
})

export default store
