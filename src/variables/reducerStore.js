import { configureStore } from '@reduxjs/toolkit'
import errorReducer from './errorSlice'

const store = configureStore({
  reducer: {
    errors: errorReducer
  }
})

export default store
