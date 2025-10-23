import React from 'react'


const LoadingState = () => {
   
   return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 shadow-lg w-[377px] aspect-square flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="text-center text-lg font-semibold mt-4">Loading...</p>
    </div>
   )
}

export default LoadingState