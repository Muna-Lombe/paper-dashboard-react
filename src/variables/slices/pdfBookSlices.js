
import { createSlice, configureStore } from '@reduxjs/toolkit'
import { updateObjectOrder } from 'variables'
// import { updateObjectOrder } from './assets/helperFunctions'
import { initData } from 'variables'
import { flattenObject } from 'variables'
import { unflattenArray } from 'variables'
import initBook from '../sampleBook.json'

const initialDataState = [...flattenObject(initBook.results[0].pages)]
const initialCorrectionsState = [{ property: '', correction: '' }]

const bookDataSlice = createSlice({
  name: 'bookData',
  initialState: initialDataState,
  reducers: {
    addBook: (state, action) => {
      // console.log("pdf0", state);

      state.push(action.payload)
    },
    addPage: (state, action) => {
      state.push(action.payload)

    },
    resetStateWithNewBook: (state, action) => {
      return action.payload
    },
    updateBook: (state, action) => {
      const { pathArray, update } = action.payload
      console.log('path-array:', state, pathArray, update)

      const item = state.find(item => item[0] === pathArray.join('-'))
      item[1] = update
    },
    updateBookOrder: (state, action) => {
      const { path, newOrder } = action.payload
      return updateObjectOrder(unflattenArray(state), path, newOrder)
    },
    removeBook: (state, action) => {
      state.bookData = state.bookData.filter(
        bookData => bookData !== action.payload
      )
    }
  }
})

export const { addBook, addPage, resetStateWithNewBook, updateBook, removeBook, updateOrder } =
  bookDataSlice.actions;

export const bookDataSliceReducer = bookDataSlice.reducer

