
import { createSlice, configureStore } from '@reduxjs/toolkit'
import { updateObjectOrder } from 'variables'
// import { updateObjectOrder } from './assets/helperFunctions'
import { initData } from 'variables'
import { flattenObject } from 'variables'
import { unflattenArray } from 'variables'


const initialDataState = [...flattenObject(initData)]
const initialCorrectionsState = [{ property: '', correction: '' }]

const pdfDataSlice = createSlice({
  name: 'pdfData',
  initialState: initialDataState,
  reducers: {
    addData: (state, action) => {
      // console.log("pdf0", state);

      state.push(action.payload)
    },
    resetStateWithNewData: (state, action) => {
      return action.payload
    },
    updateData: (state, action) => {
      const { pathArray, update } = action.payload
      console.log('path-array:', state, pathArray, update)

      const item = state.find(item => item[0] === (pathArray.join('-')))
      item[1] = update
    },
    updateOrder: (state, action) => {
      const { path, newOrder } = action.payload
      return updateObjectOrder(unflattenArray(state), path, newOrder)
    },
    removeData: (state, action) => {
      state.pdfData = state.pdfData.filter(
        pdfData => pdfData !== action.payload
      )
    }
  }
})

export const { addData, resetStateWithNewData, updateData, removeData, updateOrder } =
  pdfDataSlice.actions;

export const pdfDataSliceReducer = pdfDataSlice.reducer

const pdfCorrectionsSlice = createSlice({
  name: 'pdfCorrections',
  initialState: initialCorrectionsState,
  reducers: {
    addCorrection: (state, action) => {
      // console.log("pdf0", state);

      state.push({ property: '', correction: '' })
    },
    updateCorrection: (state, action) => {
      const { index, field, value } = action.payload
      if (field) {
        state[index][field] = value
      }
    },
    removeCorrection: (state, action) => {
      const index = action.payload
      const newState = state.filter((corrections, idx) => idx !== index)
      if (newState.length < 1) {
        newState.push({ property: '', correction: '' })
      }
      return newState
    }
  }
})

export const { addCorrection, updateCorrection, removeCorrection } =
  pdfCorrectionsSlice.actions;
export const pdfCorrectionsSliceReducer = pdfCorrectionsSlice.reducer
