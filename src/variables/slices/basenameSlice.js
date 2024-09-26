// taostReducer.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  basenames: []
}

const basenameSlice = createSlice({
  name: 'basenames',
  initialState,
  reducers: {
    addBasename: (state, action) => {
      state.basenames.push(action.payload)
    },
    removeBasename: (state, action) => {
      state.basenames = state.basenames.filter(basename => basename !== action.payload)
    }
  }
})

export const { addBasename, removeBasename } = basenameSlice.actions
export default basenameSlice.reducer
