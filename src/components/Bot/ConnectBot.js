import React, { useEffect, useState } from 'react';
import botImg from '../../assets/img/bot-landing.png'
const ConnectBot = ({stage, qrcode, handlerBotConnect, handleQrRefresh}) => {


  
  
  const UnconnectedState = () =>(
     <>
      <div className="flex flex-col items-center justify-center h-[377px] w-[377px] relative p-4">
        <img
          src={botImg}
          className="h-full w-full aspect-square"
          alt="Card image cap"
        />
        <div className="absolute inset-0 flex items-center justify-center w-[90%] aspect-square rounded-md bg-gray-800 bg-opacity-60">
          <button
            onClick={(e) => handlerBotConnect(e)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Register Bot
          </button>
        </div>
      </div>
    </>
    
  )
  
  const ScanCodeState =()=>{
    // const [refresh, setRefresh] = useState(false)
    
    const UnrefreshState = () =>(
      <>
        <div className="flex flex-col items-center justify-center p-4">
          <img
            src={qrcode}
            className="flex w-[377px] aspect-square"
            alt="QR Code"
          />
          <p
            id="no-refresh"
            className="text-black font-bold text-base flex justify-center items-center"
          >
            Scan the QR Code to register your bot
          </p>
        </div>
      </>
    )
    useEffect(() => {
      if (stage === 'scanningQr' ) {
        const refreshElem = document.getElementById("refresh")
        const noRefreshElem = document.getElementById("no-refresh")
        // setTimeout(() => {
        //   // setRefresh(true)
        //   refreshElem ? refreshElem.style.display = "flex" : (()=>"")()
        //   noRefreshElem ? noRefreshElem.style.display = "hidden" : (() => "")()

        // },20000)
      }

      return () => {
        "second"
      }
    }, [])
    return(
      <>
        {/* <RefreshState/>  */}
        <UnrefreshState/>
      
      </>
    )
  }
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 shadow-lg">
      {
        stage==="disconnected" ? <UnconnectedState/> : <ScanCodeState/>
      }
    </div>
  )
}

export default ConnectBot