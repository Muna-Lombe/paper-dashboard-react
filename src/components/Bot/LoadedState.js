import React from 'react'
import botImg from '../../assets/img/bot-landing.png'

const LoadedState = () => {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 shadow-lg w-[377px] aspect-square flex items-center justify-center p-4">
      <img
        src={botImg}
        className="w-full h-full object-contain"
        alt="Bot Connected"
      />
      <p className="text-center text-lg font-semibold mt-4">Bot is connected</p>
    </div>
  )
}

export default LoadedState;