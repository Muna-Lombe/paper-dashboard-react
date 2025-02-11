import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'
import { flattenObject } from 'variables'
import { resetStateWithNewData } from 'variables/slices/pdfSlices'
import { useDispatch, useSelector } from 'react-redux'

const { useState } = require("react")


// const [useWebSocket, setUseWebSocket] = useState(false)

export default function useSocketWrapper({
  url='ws://localhost:8000/ws', onOpenCallback, onMessageCallback
 , onCloseCallback, onErrorCallback}){
  const [socketUrl, setSocketUrl] = useState(url)
  const dispatch = useDispatch()

  const defaultOnOpen = (ev, socket) => {
      socket.sendJsonMessage({ event: 'begin-process-pdfs' })
    }
  const defaultOnMessage = (ev,socket) => {
  try {
    const jsonData = JSON.parse(ev.data)
    console.log(jsonData)

    // setData(jsonData["output"]);
    dispatch(resetStateWithNewData(flattenObject(jsonData.output.results)))
  } catch (error) {
    console.error('Error parsing JSON:', error)
  }
}

  
  const defaultOnClose = (ev,socket) => console.log('closed')
  const defaultOnError = (ev, socket) => {
  console.error('WebSocket error:', ev.error)
}

  const socket = useWebSocket(socketUrl, {
    onOpen:(ev)=> onOpenCallback(ev, socket), //|| defaultOnOpen(ev,socket),
    onClose:(ev)=> onCloseCallback(ev, socket), //|| defaultOnClose(ev,socket) ,

    onMessage:(ev)=> onMessageCallback(ev, socket), //|| defaultOnMessage(ev,socket),

    onError:(ev)=> onErrorCallback(ev, socket), //|| defaultOnError(ev,socket) ,

    shouldReconnect: closeEvent => true,
    reconnectAttempts: 10
  })
  // const {
  //   sendMessage,
  //   sendJsonMessage,
  //   lastMessage,
  //   lastJsonMessage,
  //   readyState
  // } = socket
  socket.socket = socket
  return socket
}
