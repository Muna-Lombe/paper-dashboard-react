import { configureStore } from '@reduxjs/toolkit'
import errorReducer from './slices/errorSlice'
import toastSlice from './slices/toastSlice'
import basenameSlice from './slices/basenameSlice';
import { pdfCorrectionsSliceReducer, pdfDataSliceReducer } from './slices/pdfSlices';

const toastReducer = toastSlice;
const store = configureStore({
  reducer: {
    errors: errorReducer,
    toasts: toastReducer,
    basenames: basenameSlice,
    pdfData: pdfDataSliceReducer,
    pdfCorrections: pdfCorrectionsSliceReducer

  }
})

export default store
