import React, { useCallback, useEffect, useState } from 'react'
import LoadingState from './LoadingState'
import ConnectBot from './ConnectBot'
import LoadedState from './LoadedState'
import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'
import { UncontrolledAlert } from 'reactstrap'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card,
  CardImg,
  CardHeader,
  CardBody,
  CardText,
  CardFooter,
  CardTitle,
  Row,
  Col,
  Table, 
  Button
} from 'reactstrap'
import { Link } from 'react-router-dom'
import { addError } from '../../variables/errorSlice'
import { addToast } from '../../variables/toastSlice'



export default ({onNotify, hookedNotify}) => {
  const [connection, setConnection] = useState({scanningQr:false, gettingQr:false, isConnecting: false, isConnected: false, error: null})
  const [qrCode, setQrCode] = useState("https://picsum.photos/900/180")
  const [socketUrl, setSocketUrl] = useState('ws://localhost:5000/api/bot');
  const [messageHistory, setMessageHistory] = useState([]);
  const sessToken = sessionStorage.getItem('token');

  const dispatch = useDispatch()
  
  const socket = useWebSocket(socketUrl, {
    onOpen: () =>  {socket.sendJsonMessage({event: 'ping', token: sessToken})},
    onClose: () => console.log('closed'),
    shouldReconnect: (closeEvent) => true,
    
  });
  
  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState } = socket;
  
  const  stages = [ "disconnected", "gettingQr", "scanningQr", "connecting", "connected"];

   const addStatusStyle =(status)=>{
      switch(status){
        case 'running':
          return 'text-success'
        case 'stopped':
          return 'text-danger'
        default:
          return 'text-muted'

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
            '<p class='+addStatusStyle(bot.status)+'>'+bot?.status+'</p>'
          ) : (
            '<p className=\'text-muted\'>disconnected</p>'
          )}
        </td>
      `
      return row
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
     
      if (lastJsonMessage?.event === "botHealthCheck"){
        const { data } = lastJsonMessage
        

        if (data?.bots?.length > 0) {
          // const childBody = botsTable.getElementsByTagName('tbody')[0]
          // // console.log("setting connection state", bots, childBody);
          // bots.forEach((bot,i)=>(childBody.insertAdjacentElement("beforeend", createtableRow({i, ...bot}))))
          setConnection((ps) => ({ ...ps, bots:data?.bots, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: true }))
        
        }

      }

      if(lastJsonMessage?.event === "ping"){
        
        if (lastJsonMessage?.status === "connected"){
          setConnection((ps) => ({ ...ps, error: null, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: true }))
        }
        if (lastJsonMessage?.status === "disconnected") {
          setConnection((ps) => ({ ...ps, error: { message: "bot error" }, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: false }))
        } 
        
        setTimeout(() => {
          socket.sendJsonMessage({event: 'botHealthCheck', token: sessToken})
          
        }, 300);
        // if (lastJsonMessage?.status === "stopped") {
        //   setConnection((ps) => ({ ...ps, error: { message: "bot error" }, gettingQr: false, scanningQr: false, isConnecting: false, isConnected: false }))
        // }

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
      if (lastJsonMessage?.event === "disconnect" && lastJsonMessage?.status === "complete") {
        dispatch(addToast("Bot disconnected"))
        
      }
      if (lastJsonMessage?.event === "disconnect" && lastJsonMessage?.status === "fail") {
        dispatch(addError("Failed to disconnect Bot: ", lastJsonMessage.data.botId.split("_")[2]))

        
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
  const handleConnect = (e) => {
    e?.preventDefault();
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

  const handleReconnect = (e, id) =>{
    e?.preventDefault();
    handleClickSendMessage({event:"botHealthCheck", token:sessToken, botId:id})
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
   
    return(
      <Card className="card-stats" style={{width:"377px", aspectRatio:"1/1", display:"flex", justifyContent:"center"}}>
        <CardBody>
          <Table id='bots-table' size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Bot ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* will add dynamically through useEffect */}
              {
                connection?.bots?.map((bot, index) => {
                  return (
                    <tr key={index}>
                      <th scope='row'>{ index+1}</th>
                      <td>{bot?.token.split("_")[2]}</td>
                      <>
                        {bot ? (
                          <td class={addStatusStyle(bot.status)}>{bot?.status}</td>
                        ) : (
                          <td className='text-muted'>disconnected</td>
                        )}
                      </>
                      <td >
                        <i onClick = {(e)=> handleReconnect(e, bot.token) }
 className='fas fa-sync-alt text-muted btn-md  btn-neutral' />
                        <i onClick = {(e)=> handleDisconnect(e, bot.token) }
 className='fas fa-trash-alt text-muted btn-md btn-neutral 
                        btn-danger  ' />

                      </td>
                    </tr>
                  )

                })
              }
              
            </tbody>
          </Table>        
        </CardBody>
      </Card>
   
    
  )}

  if(connection.isConnected){
    return (
      <BotStatusState/>
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
      <ConnectBot 
        stage={stages[0]} 
        handlerBotConnect={handleBotConnect}
        handleQrRefresh={handleQrRefresh}
        
      />
    </>
  )
}
