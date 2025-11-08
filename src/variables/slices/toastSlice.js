// toastSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  toasts: []
}

const toastSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const toast = {
        id: action.payload.id || Date.now() + Math.random(),
        message: action.payload.message || action.payload,
        type: action.payload.type || 'info',
        autoClose: action.payload.autoClose !== undefined ? action.payload.autoClose : 3000,
        timestamp: new Date().toISOString()
      }
      state.toasts.push(toast)
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
    clearToasts: (state) => {
      state.toasts = []
    }
  }
})

export const { addToast, removeToast, clearToasts } = toastSlice.actions
export default toastSlice.reducer

