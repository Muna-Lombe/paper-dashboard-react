import React, { useCallback, useEffect, useState } from 'react'
import LoadingState from './LoadingState'
import ConnectBot from './ConnectBot'
import LoadedState from './LoadedState'
// import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { addError } from '../../variables/slices/errorSlice'
import { addToast } from '../../variables/slices/toastSlice'
import { endpoints } from '@/config'
import useSocketWrapper from '../../variables/hooks/useSocketWrapper'


export default ({onNotify, hookedNotify}) => {
      const [connection, setConnection] = useState({scanningQr:false, gettingQr:false, isConnecting: false, isConnected: false, error: null})
      const [qrCode, setQrCode] = useState("https://picsum.photos/900/180")
      // const [socketUrl, setSocketUrl] = useState(endpoints.bot.socketUrl);
      // const [messageHistory, setMessageHistory] = useState([]);
      const sessToken = sessionStorage.getItem('token');

      const dispatch = useDispatch()
      
      const socket = useSocketWrapper({
        url: endpoints.bot.socketUrl,
        onOpenCallback: (ev, ws) => {
          ws.sendJsonMessage({event: 'ping', token: sessToken})
        },
        onCloseCallback: (ev, ws) => console.log('closed'),
        // onMessageCallback: (ev, ws) => {},
        // onErrorCallback: (ev, ws) => {},
      });
      
      const { sendJsonMessage, lastJsonMessage, readyState } = socket;
      
      const  stages = [ "disconnected", "gettingQr", "scanningQr", "connecting", "connected"];

      const addStatusStyle =(status)=>{
        switch(status){
          case 'running':
            return 'text-green-500'
          case 'stopped':
            return 'text-red-500'
          default:
            return 'text-gray-500'

        }
      }
      const createtableRow =(bot)=>{

          const row = document.createElement("tr");
          row.id = bot.token;
          row.innerHTML = `
            <th scope='row'>${bot.i + 1}</th>
            <td>${bot?.token}</td>
            <td>
              ${bot ? (
                '<p class="'+addStatusStyle(bot.status)+'" >' + bot?.status + '</p>'
              ) : (
                '<p className=\'text-muted\'>disconnected</p>'
              )}
            </td>
          `
          return row
      }

      const onBotHealthCheckEvent=()=>{
      if (lastJsonMessage?.event === "botHealthCheck"){
        const { data } = lastJsonMessage
        

        if (data?.bots?.length > 0) {
          // const childBody = botsTable.getElementsByTagName('tbody')[0]
          // // console.log("setting connection state", bots, childBody);
          // bots.forEach((bot,i)=>(childBody.insertAdjacentElement("beforeend", createtableRow({i, ...bot}))))
          setConnection((ps) => ({ ...ps, bots:data?.bots, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: true }))
        
        }

      }

    }
    const onPingEvent=()=>{
      if (lastJsonMessage?.event === "ping") {

        if (lastJsonMessage?.status === "connected"){
          setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: true }))
        }
        if (lastJsonMessage?.status === "disconnected") {
          setConnection((ps) => ({ ...ps, error: { message: "bot error" }, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: false }))
        } 
        
        setTimeout(() => {
          sendJsonMessage({event: 'botHealthCheck', token: sessToken})
          
        }, 300);
        // if (lastJsonMessage?.status === "stopped") {
          //   setConnection((ps) => ({ ...ps, error: { message: "bot error" }, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: false }))
          // }
      }

    }
    const onRegisterEvent=()=>{
      if (lastJsonMessage?.event === "register"){
        if(lastJsonMessage?.status === "gettingQr"){
          setConnection((ps) => ({ ...ps, gettingQr: true }))
        }
        if (lastJsonMessage?.status === "scanningQr") {
          setConnection((ps) => ({ ...ps, error:null, gettingQr: false, scanningQr:true }));
          
          setQrCode(lastJsonMessage?.data?.qrLink)
          // setMessageHistory((prev) => prev.concat(lastJsonMessage));
        }
        if (lastJsonMessage?.status === "pending") {
          setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting:true }))
        }
        if (lastJsonMessage?.status === "complete") {
          const { data } = lastJsonMessage
          
          
          if (data?.bots?.length > 0) {
            // const childBody = botsTable.getElementsByTagName('tbody')[0]
            // // console.log("setting connection state", bots, childBody);
            // bots.forEach((bot,i)=>(childBody.insertAdjacentElement("beforeend", createtableRow({i, ...bot}))))
            setConnection((ps) => ({ ...ps, bots:data?.bots, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: true }))
            
          }else{
            setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected:true }))
          }
          
        }
        if (lastJsonMessage?.status === "fail") {
          
          setConnection((ps) => ({ ...ps, error: "bot registration failed", gettingQr: false, scanningQr: false, isConnecting: false, isConnected:false }))
        }
        
      }  
      
    }
    const onConnectEvent=()=>{
      if (lastJsonMessage?.event === "connect"){
        if(lastJsonMessage?.status === "pending") {
          setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting:true }))
        }
        if (lastJsonMessage?.status === "complete") {
          const { data } = lastJsonMessage
          if (data?.bots?.length > 0) {
            // const childBody = botsTable.getElementsByTagName('tbody')[0]
            // // console.log("setting connection state", bots, childBody);
            // bots.forEach((bot,i)=>(childBody.insertAdjacentElement("beforeend", createtableRow({i, ...bot}))))
            setConnection((ps) => ({ ...ps, bots:data?.bots, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: true }))
          
          }else{
            setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected:true }))
          }
          // setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected:true }))
        }
        if (lastJsonMessage?.status === "fail") {
          if(lastJsonMessage.message === "request_bot_register"){
            // handleBotRegister();
            setConnection((ps) => ({ ...ps, error: "bot registration failed", gettingQr: false, scanningQr: false, isConnecting: false, isConnected:false }))
  
          }
          setConnection((ps) => ({ ...ps, error: "bot registration failed", gettingQr: false, scanningQr: false, isConnecting: false, isConnected:false }))
        }
      } 

    }
    const onDisconnectEvent=()=>{
      if (lastJsonMessage?.event === "disconnect"){
        if (lastJsonMessage?.status === "complete") {
          dispatch(addToast("Bot disconnected"))
          setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected:false }))
          
        }
        if (lastJsonMessage?.status === "fail") {
          dispatch(addError("Failed to disconnect Bot: ", lastJsonMessage.data.botId.split("_")[2]))
  
          
        }

      }
    }
    useEffect(() => {
      
      if (lastJsonMessage !== null && document.readyState === "complete") {
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
        

        onBotHealthCheckEvent()
        onPingEvent()
        onRegisterEvent();
        onDisconnectEvent()
        onConnectEvent()

      }
      return () => {}
    }, [lastJsonMessage]);

    const handleClickSendMessage = useCallback((msg) => sendJsonMessage(msg), [sendJsonMessage])


    const handleBotRegister = async (e) => {
      e?.preventDefault();
      
      setConnection(ps => ({ ...ps, isConnecting: true, gettingQr: false }));

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
      const res =  sendJsonMessage({
        event: 'register',
        token: sessToken
      })
      // const resData = messageHistory.at(-1) || {error:true}
      // console.log('red', resData)
      
      
      // setConnection(ps => ({ ...ps, isConnecting: false, gettingQr: true }))

    }


    const handleConnectingState =() => {

    }
    
    const handleQrRefresh =async(e) =>{
      e.preventDefault();
      setConnection(ps=> ({...ps, gettingQr: true}))
      await getQr()

    }
    const handleConnect = (e, botId) => {
      e?.preventDefault();
      sendJsonMessage({
        event: 'connect',
        token: sessToken,
        botId:botId 
      })
      setConnection(ps=> ({...ps, isConnecting: false, isConnected: true}))
    }
    const handleRemoveBot = (e, id) =>{
      e?.preventDefault()
      sendJsonMessage({ event: 'remove', token: sessToken, botId: id })
      // setConnection(ps => ({ ...ps, isConnected: false, isConnecting: false }))

    }
    const handleDisconnect = (e, id) => {
      e?.preventDefault();
      sendJsonMessage({event:"disconnect",token:sessToken, botId:id })
      // setConnection(ps=> ({...ps, isConnected: false, isConnecting: false}))
    }

    const handleRefreshBotState = (e, id) =>{
      e?.preventDefault();
      sendJsonMessage({event:"botHealthCheck", token:sessToken, botId:id})
    }

    if(connection.scanningQr){
      return (
        <ConnectBot stage={stages[2]} qrcode={qrCode} handler={handleQrScan} />
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

    const BotStatusState = ()=>{
      const ShouldConnectState =({bot})=>(
        <td colSpan={2} className="text-center bg-gray-200 opacity-50 p-2">
          <button className="px-2 py-1 text-sm bg-blue-500 text-white rounded" onClick={(e)=>handleConnect(e, bot.token)}>Connect</button>
        </td>

      )
      const DefaultState = ({bot})=>(
        <>
          <td>
            <span>{
                bot?.token.split("_")[2].length>8 ? 
                bot?.token.split("_")[2].slice(8)+"..." :
                bot?.token.split("_")[2]} </span>
            
            <i onClick = {(e)=> handleRefreshBotState(e, bot.token) } className="fas fa-sync-alt text-gray-500 text-base cursor-pointer ml-2" />
          </td>
          <>
            {bot ? (
              <td className={addStatusStyle(bot.status)}>{bot?.status}</td>
            ) : (
              <td className="text-gray-500">disconnected</td>
            )}
          </>
          <td>
            <i onClick = {(e)=> handleDisconnect(e, bot.token) } className="fas fa-trash-alt text-gray-500 text-base cursor-pointer hover:text-red-500" />

          </td>
        </>
      )
      const BotItem =({idx, bot})=>{
        // const [shouldConnect, setShouldConnect] = useState(true)
        
        return (
          <tr key={idx} className="relative">
            <th scope='row'>{ idx+1}</th>
            {
              bot.status === "stopped"
              ? <ShouldConnectState bot={bot}/>
              : <DefaultState bot={bot}/>
            }
          </tr>
        )
      }
      return(
        <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 shadow-lg w-[377px] aspect-square flex justify-center p-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded">
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <table id="bots-table" className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">#</th>
                    <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Bot ID</th>
                    <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {connection?.bots?.map((bot, index) => {
                    return (
                      <BotItem idx={index} bot={bot} key={index} />
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    
      
    )}

    if(connection.isConnected){
      return (
        <BotStatusState/>
      )
    }

    
    
    return (
      <>
        <ConnectBot 
          stage={stages[0]} 
          handlerBotConnect={handleBotRegister}
          handleQrRefresh={handleQrRefresh}
          
        />
      </>
    )
}

