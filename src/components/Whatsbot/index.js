import React, { useCallback, useEffect, useState } from 'react'
import LoadingState from './LoadingState'
import ConnectBot from './ConnectBot'
import LoadedState from './LoadedState'
import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'
import { UncontrolledAlert } from 'reactstrap'
import NotificationAlert from 'react-notification-alert'
import { addError } from 'variables/errorSlice'
import { useSelector, useDispatch } from 'react-redux'


export default ({onNotify, hookedNotify}) => {
  const [connection, setConnection] = useState({scanningQr:false, gettingQr:false, isConnecting: false, isConnected: false, error: null})
  const [qrCode, setQrCode] = useState("https://picsum.photos/900/180")
  const [socketUrl, setSocketUrl] = useState('ws://localhost:5000/api/bot');
  const [messageHistory, setMessageHistory] = useState([]);

  const dispatch = useDispatch()



  
  const notificationAlert =  React.useRef()
  const notify = (place, color, message) => {
    // var color = Math.floor(Math.random() * 5 + 1);
    var type;
    switch (color) {
      case 1:
        type = "primary";
        break;
      case 2:
        type = "success";
        break;
      case 3:
        type = "info";
        break;
      case 4:
        type = "warning";
        break;
      case 5:
        type = "danger";
        break;
      default:
        break;
    }
    var options = {};
    options = {
      place: place,
      message: (
        <div className="">
          {message}
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    // notificationAlert.current.notificationAlert(options);
  };
 
  const socket = useWebSocket(socketUrl, {
      onOpen: () =>  {socket.sendJsonMessage({event: 'ping', token: sessionStorage.getItem('token')})},
      onClose: () => console.log('closed'),
      shouldReconnect: (closeEvent) => true,
      
    });

  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState } = socket;
  
  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log("lastJsonMessage", lastJsonMessage)
      if (lastJsonMessage?.error) {
        // notify('tl', 5, lastJsonMessage.error.message)
        const elem=  () => (
          <span>
            {lastJsonMessage.error.message}
            <i className='fa fa-error' />
          </span>
        )
        dispatch(addError(lastJsonMessage.error.message))
        // notif("tr", elem)
        return setConnection((ps) => ({scanningQr:false, gettingQr:false, isConnecting: false, isConnected: false, error: { message: "bot error" } }))
      }
      const data = lastJsonMessage;
      if(lastJsonMessage?.event === "ping" && lastJsonMessage?.status === "running"){
        setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: true }))
      }
      if (lastJsonMessage?.event === "ping" && lastJsonMessage?.status === "stopped") {
        setConnection((ps) => ({ ...ps, error: { message: "bot error" }, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: false }))
      } 
      if (lastJsonMessage?.event === "connect" && lastJsonMessage?.status === "gettingQr"){
        setConnection((ps) => ({ ...ps, gettingQr: true }))
      }
      if (lastJsonMessage?.event === "connect" && lastJsonMessage?.status === "scanningQr") {
        setConnection((ps) => ({ ...ps, error:null, gettingQr: false, scanningQr:true }));
        
        setQrCode(lastJsonMessage?.data?.qrLink)
        setMessageHistory((prev) => prev.concat(lastJsonMessage));
      }
      if (lastJsonMessage?.event === "connect" && lastJsonMessage?.status === "pending") {
        setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting:true }))
      }
      if (lastJsonMessage?.event === "connect" && lastJsonMessage?.status === "complete") {
        setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected:true }))
      }
    }
    return () => {}
  }, [lastJsonMessage]);

  const handleClickSendMessage = useCallback((msg) => sendJsonMessage(msg), [])


  const handleBotConnect = async (e) => {
    e.preventDefault();
    // const url = 'http://localhost:5000/bot/connect'
    
    setConnection(ps => ({ ...ps, isConnecting: true, gettingQr: false }))

    // const res = await fetch(
    //   url,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: "Bearer " + (localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibW9vcmhvdXNlRU5UIiwiaWF0IjoxNzEwNzEzMTkzfQ.5_SXADx6j1mdAvpX7MDFx5CrlZ_HeWkXdMrKbVm1zmI")
    //     },
    //     body: JSON.stringify({
    //       token: sessionStorage.getItem("token")
    //     })
    //   }
    // )
    

    // setTimeout(() => {
    //   handleQrScan({preventDefault: ()=>{}})
    // }, 5000);

    await getQr()
  }

  const handleQrScan = (e) => {
    e.preventDefault();
    setConnection(ps=> ({...ps, gettingQr:false, isConnecting: true}))
    setTimeout(() => {
      // handleConnect({preventDefault: ()=>{}})
    }, 5000);
  }

  const getQr =async () =>{
    const res = await handleClickSendMessage({
      event: 'connect',
      token: sessionStorage.getItem('token')
    })
    // const resData = messageHistory.at(-1) || {error:true}
    // console.log('red', resData)
    
    
    // setConnection(ps => ({ ...ps, isConnecting: false, gettingQr: true }))

  }


  const handleConnectingState =() => {

  }
  
  const handleErrorState =() =>{

  }
  const handleConnect = (e) => {
    e?.preventDefault();
    setConnection(ps=> ({...ps, isConnecting: false, isConnected: true}))
  }

  if(connection.scanningQr){
    return (
      <ConnectBot stage="scanQr" qrcode={qrCode} handler={handleQrScan} />
    )
  }
  
  if(connection.gettingQr){
    return (
      <LoadingState/>
    )
  }
  if(connection.isConnecting){
    return (
      <LoadingState/>
    )
  }

  if(connection.isConnected){
    return (
      <LoadedState/>
    )
  }

  const Notification = ({message}) =>(
    <UncontrolledAlert color="danger" fade={true}>
      <span>
        {message}
      </span>
    </UncontrolledAlert>
  )
  return (
    <>
      {/* <NotificationAlert ref={notificationAlert} /> */}
      <ConnectBot stage="getQr" handler={handleBotConnect}/>
    </>
  )
}

