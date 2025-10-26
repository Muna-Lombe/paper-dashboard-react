// errorReducer.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  errors: []
}

const errorSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    addError: (state, action) => {
      state.errors.push(action.payload)
    },
    removeError: (state, action) => {
      state.errors = state.errors.filter(error => error !== action.payload)
    },
    clearErrors: (state, action) => {
      state.errors = []
    }
  }
})

export const { addError, removeError, clearErrors } = errorSlice.actions
export default errorSlice.reducer

