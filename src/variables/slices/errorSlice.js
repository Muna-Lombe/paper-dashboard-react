// errorSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  errors: []
}

const errorSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    addError: (state, action) => {
      const error = {
        id: action.payload.id || Date.now() + Math.random(),
        message: action.payload.message || action.payload,
        type: 'error',
        autoClose: action.payload.autoClose !== undefined ? action.payload.autoClose : 5000,
        timestamp: new Date().toISOString()
      }
      state.errors.push(error)
    },
    removeError: (state, action) => {
      state.errors = state.errors.filter(error => error.id !== action.payload)
    },
    clearErrors: (state) => {
      state.errors = []
    }
  }
})

export const { addError, removeError, clearErrors } = errorSlice.actions
export default errorSlice.reducer

