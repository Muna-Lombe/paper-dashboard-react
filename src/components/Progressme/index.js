
import React, { memo, useEffect, useState } from 'react';
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
  Button,
  FormGroup,
  Form,
  Input,
  Label
} from 'reactstrap'
import useWebSocket, { ReadyState, useSocketIO } from 'react-use-websocket'
import Cookie from 'browser-cookie';
import { AxiosHeaders } from 'axios';
import { bindActionCreators } from '@reduxjs/toolkit';
import { Axios } from 'axios';
import fetchWithProxy from '../../variables/fetchWithProxy';
import spirow from "../../assets/img/spriral-arrow.png";
// import { Form } from 'react-router-dom';
const axios = new Axios()

const Scrapper = () => {
  const [targetUrl, setTargetUrl] = useState('https://progressme.ru/')
  const [isAuthed, setIsAuthed] = useState(false)
  const [testUrl, setTestUrl] = useState('https://progressme.ru/SharingMaterial/c172ca5c-2488-4a14-843f-8caf7c993c79');
  // const [sockets, setSockets] = useState({})
  const sess = sessionStorage
  const sessToken = sess.getItem('token')

  const cookie = new Cookie({
  json: true,
  path: '/',
  domain: 'progressme.ru',
  secure: true
  });

  const {GetIdMaterialMessage, GetBookMessage, CopySharedBookMessage,GetCurrentUserMessage, GetUserMessage, GetDebugMessage} ={
      GetIdMaterialMessage: {
        "controller":"SharingMaterialWsController","method":"GetIdMaterial",
        "value":`{"Code":"${targetUrl.split("SharingMaterial/")[1] || ""}"}`
      },
      GetBookMessage:(bookId)=>({
        "controller":"SharingMaterialWsController","method":"GetBook",
        "value":`{"BookId":${bookId},"UserId":null}`
      }),
      CopySharedBookMessage:(bookId, userId)=>({
        "controller":"BookWsController","method":"CopyBook",
        "value":`{"BookId":${bookId},"UserId":${userId}}`
      }),
      GetCurrentUserMessage:{"controller":"Auth","metod":"GetCurrentUser","value":"\"\""},
      GetUserMessage:{"controller":"User","metod":"GetSettingsSource","value":"\"\""},
      GetDebugMessage: {"controller":"Debug","metod":"Ping","value":"\"\""}

    }
  const targetUrlSet = () =>(
      targetUrl.match(
      /^https?:\/\/(?:www\.)?(?:new\.)?progressme\.ru\/(?:sharing-material|SharingMaterial)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
    )?.[0]?.length || false
  );


  const handleClick = (e) => {
      e.preventDefault();
      
      // console.log(e.target?.[0]?.value);
      

      let url = (e.target?.[0]?.value || "")?.replace("new.","").replace("edvibe.com","progressme.ru").replace("sharing-material", "SharingMaterial").replace("course", "SharingMaterial") ;

      const regx = /^https?:\/\/(?:www\.)?(?:new\.)?progressme\.ru\/(?:sharing-material|SharingMaterial)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
 
      if(!url.toString().match(regx)?.[0].length){
        url = testUrl;
      }
      // console.log("url:", url);
      setTargetUrl(url.startsWith("https://")? url : "https://www."+url)
  }


  const disableLogs=async(e)=>{

    setTimeout(() => {
      console.log("disabling logs")//, e, e.target.contentWindow);
      
    }, 3000);


    
  }

  const handleSave = (e, sockets)=>{
    e.preventDefault();
    const [bookId, userId] = [sess.getItem("bookId"),sess.getItem("userId")];
    sockets["bookSocket"]?.sendJsonMessage(CopySharedBookMessage(bookId, userId));

    setTimeout(() => {
      setTargetUrl("https://progressme.ru/TeacherAccount/materials/personal")
    }, 10000);
  }
  const hasNoBookUserId = ()=> (!(sess.getItem('bookId')?.length > 0 && sess.getItem('userId').length > 0));

  
  useEffect(() => {
      if(document.readyState === "complete"){
        if (targetUrl){
            const iframe = document.getElementById("iframe_iframe")
            iframe?.setAttribute("src", targetUrl)
        }
        if(sess.getItem("userId")){
          const userId = sess.getItem("userId");

          if(document.getElementById("user-id")?.value){ 
            document.getElementById("user-id").value = userId
          }
        }
        if(sess.getItem("bookId")){
          const bookId = sess.getItem("bookId");
          if(document.getElementById("book-id")?.value){ 
            document.getElementById("book-id").value = bookId
          }
        }      
        if(sess.getItem("bookName")){
          const bookName = sess.getItem("bookName");
          if(document.getElementById("book-name")?.value){ 
            document.getElementById("book-name").value = bookName
          }
        }
      }
    
      return () => {
        // second
      }
    }, [targetUrl, isAuthed])
 
    

    const handleAuth = async(e)=>{
      e.preventDefault();
      // document.domain = "www.progressme.ru";
      const {email, password} = ((fd)=>({email:fd.get("email"), password:fd.get("password")}))(new FormData(document.forms["auth-in"]));
      
      const authUrl ='https://progressme.ru/Account/Login';

      
      const authBody = {
          "Email": email|| 'dante773@protonmail.com',
          "Password": password || '1901',
          "UserRole": 0,
          "ReturnUrl": '',

        };
      const authHeaders = new AxiosHeaders()
        
        
      Object.entries({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://progressme.ru',
        'Referer': 'https://progressme.ru/Account/Login',
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate, br",
        "Access-Control-Allow-Origin":"*",
        "Access-Control-Allow-Methods":"GET, POST",
        "Connection": "keep-alive",
        'User-Agent': 'PostmanRuntime/7.40.0',
        "x-cors-api-key": "temp_16411e0f52e7224a8fecf2d3b77b8c27"
      }).forEach(([k,v])=>{
          // console.log("k:", k);
          authHeaders.set(k,v,true)
      })
        
      const res = await fetchWithProxy(authUrl, {
        method: 'POST',
        headers: authHeaders.toJSON(),
        body: JSON.stringify(authBody),
        
      });
        
      const data = await res.json()
    
      sess.setItem('userId', data.Value.Id)
      setIsAuthed(ps => !ps)
  
    };

      const handleReset=(e)=>{
        e.preventDefault();
        sess.removeItem("bookId");
        sess.removeItem("bookName");
        
        setTargetUrl("https://progressme.ru");
      }
      
      const SocketComponent = memo(({onSave})=>{
          
          const [booksUrl, socketUrl, debugUrl] = [
            "wss://books.progressme.ru/websocket?Page=TeacherProfile&isSharing=True&token=",
            "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx?Page=TeacherProfile&isSharing=True&MessageShowToken=3740deac-bf24-43ec-b358-16ef183f7059&token=",
            "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx?Page=TeacherProfile&MessageShowToken=3740deac-bf24-43ec-b358-16ef183f7059&userRole=0&token="
          ]
    
          const [messageHistory, setMessageHistory] = useState([]);
          
          
        
          
         
          const newGuid = ()=> {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8
              return v.toString(16)
            })
          }
          const getAuthToken = ()=>{
            // sess.getItem('Auth-Token')
            
            if(sess.getItem('Auth-Token')){
              return sess.getItem('Auth-Token')
            }
    

            sess.setItem('Auth-Token',newGuid()) 
            return sess.getItem('Auth-Token')
          }
          
          const userSocket = useWebSocket(socketUrl + getAuthToken(),{
            onOpen: () => {
              userSocket.sendJsonMessage(GetUserMessage)
            },
            onMessage: (msg) => {
              // console.log("userSocket onMessage:", msg.data)
              userSocket.getWebSocket().close()
            },
            onClose: () => console.log('closed'),
            shouldReconnect: closeEvent => false
          })
    
          const bookSocket = useWebSocket(booksUrl+getAuthToken(), {
            onOpen: () =>  { 
              if(targetUrl.split("SharingMaterial/")[1]){
                bookSocket.sendJsonMessage(GetIdMaterialMessage)
              } 
            },
            onClose: () => console.log('closed'),
            shouldReconnect: (closeEvent) => false,
            
          });
          
          const debugSocket = useWebSocket(debugUrl+getAuthToken(), {
            onOpen: () =>  {debugSocket.sendJsonMessage(GetDebugMessage)},
            onClose: () => console.log('closed'),
            onMessage: (s)=>{setTimeout(() => {
              debugSocket.sendJsonMessage(GetDebugMessage)
            }, 3000);},
            shouldReconnect: (closeEvent) => false,
            
          });
          
          
          const { 
            sendMessage:sendMessageToUserSocket, 
            sendJsonMessage:sendJsonMessageToUserSocket, 
            lastMessage:lastMessageFromUserSocket, lastJsonMessage:lastJsonMessageFromUserSocket, 
            readyState:userReadyState
          } = userSocket;
    
          const { 
            sendMessage:sendMessageToBookSocket, 
            sendJsonMessage:sendJsonMessageToBookSocket, 
            lastMessage:lastMessageFromBookSocket, lastJsonMessage:lastJsonMessageFromBookSocket, 
            readyState:booksReadyState
          } = bookSocket;
    
    
          const sockets = {bookSocket, userSocket, debugSocket}
          // userSocket Handler
          useEffect(() => {
            
            if (lastJsonMessageFromUserSocket !== null) {
              // console.log("lastJsonMessageFromUserSocket", lastJsonMessageFromUserSocket)
              
              if (lastJsonMessageFromUserSocket?.Method === "GetIdMaterial" && lastJsonMessageFromUserSocket.IsSuccess) {
                // sendJsonMessage(GetBookMessage)
                // console.log("material-message:", lastJsonMessageFromUserSocket.Value);
                const val = lastJsonMessageFromUserSocket.Value;
                
                if(val.BookId){
    
                  document.getElementById("book-id").value=val.BookId
                  
                  sendJsonMessageToUserSocket(GetBookMessage(val.BookId))
                  
                }
                
              }
              
              if (lastJsonMessageFromUserSocket?.Method === 'GetCurrentUser' && lastJsonMessageFromUserSocket.IsSuccess) {
                // console.log('user-message:', lastJsonMessageFromUserSocket.Value)
                const val = lastJsonMessageFromUserSocket.Value;
                document.getElementById('user-id').value = val.UserId;
    
              }
              if (lastJsonMessageFromUserSocket?.Method === 'GetSettingsSource' && lastJsonMessageFromUserSocket.IsSuccess) {
                sendJsonMessageToUserSocket(GetCurrentUserMessage)
    
              }
    
    
    
            }
            return () => {}
          }, [lastJsonMessageFromUserSocket]);
    
          // bookSocket Handler
          useEffect(() => {
            
            if (lastJsonMessageFromBookSocket !== null) {
              // console.log("lastJsonMessageFromBookSocket", lastJsonMessageFromBookSocket)
    
              if (lastJsonMessageFromBookSocket?.Method === "GetIdMaterial" && lastJsonMessageFromBookSocket.IsSuccess) {
                // sendJsonMessage(GetBookMessage)
                // console.log("book-message:", lastJsonMessageFromBookSocket.Value);
                const val = lastJsonMessageFromBookSocket.Value;
                
                if(val.BookId){
                  
                  sess.setItem("bookId", val.BookId)
                  document.getElementById("book-id").value=val.BookId
                  
                  sendJsonMessageToBookSocket(GetBookMessage(val.BookId))
                  
                }
                
              }
              if (lastJsonMessageFromBookSocket?.Method === "GetBook" && lastJsonMessageFromBookSocket.IsSuccess ) {
                // console.log('book-message:', lastJsonMessageFromBookSocket.Value)
                const val = lastJsonMessageFromBookSocket.Value
                sess.setItem('bookName', val.Name)
    
                document.getElementById('book-name').value = val.Name
                  
                
              }
              if (lastJsonMessageFromBookSocket?.Method === 'CopyBook' && lastJsonMessageFromBookSocket.IsSuccess) {
                // console.log('copiedbook-message:', lastJsonMessageFromBookSocket.Value)
                setTimeout(() => {
                  sess.removeItem("bookId");
                  sess.removeItem("bookName");
                  
                }, 3000);
              }
      
            }
            return () => {}
          }, [lastJsonMessageFromBookSocket]);
          return(
            <Form id="save-book">
              <FormGroup className='w-100 '>
                <Input
                  className='mb-1'
                  type="text"
                  id="book-id"
                  readOnly
                  defaultValue={sess.getItem("bookId")|| "book id"}
                />
                <Input
                  className='my-1'
                  type="text"
                  id="book-name"
                  readOnly
                  defaultValue={sess.getItem("bookName")||"book name"}
                />
                <Input
                  className='mt-1'
                  type="text"
                  id="user-id"
                  readOnly
                  defaultValue={sess.getItem("userId")||"user name"}
                />
                <Button
                    className="btn-semi-round"
                    color="primary"
                    type="button"
                    disabled={hasNoBookUserId()}
                    onClick={(e)=>onSave(e, sockets)}
                  >
                    save
                  </Button>
              </FormGroup>
            </Form>
          )
        });

      const BookCopied =()=>{
        return(
          <div className="position-absolute top-100 start-50 translate-middle w-100 overlayer d-flex flex-column justify-content-center align-items-center my-5 px-2" style={{inset:0}}>
            <div className="w-100 h-100">
              <h3>
                Book Copied! 
              </h3>
              <h5>
                Log in to 
                <a href="https://progressme.ru/Account/Login" target="_blank" rel="noopener noreferrer">
                  {" progressme.ru "} 
                  <i className='fas fa-external-link' aria-hidden='true'></i>
                </a> 
                to see the book in your personal library
              </h5>
              </div>
          </div>
        )
      };

      const NoTargetUrlSet=()=>(
      <div className="position-absolute top-100 start-50 translate-middle w-100 overlayer d-flex flex-column justify-content-center align-items-center px-2" style={{inset:0}}>
        <img src={spirow} className='w-25 scale-x-[-1] rotate-90'/>
        <h4 className='w-75'>
          Add the link to your book up here and see the magic
        </h4>
      </div>
      );

      const IntermediateComponent = ()=>{
        
        return(
          <div className="w-100 position-relative">
            <div className="w-100 h-100 bg-img">
              <img src="https://static.tildacdn.com/tild3633-3338-4961-b237-633361646262/Footer_Bg.svg"/>
            </div>
            {
              hasNoBookUserId() ? (
                <NoTargetUrlSet/>
              )
              : (
                <BookCopied/>
              )
            }
            
          </div>
        )
      };

      
      const AuthIn = ()=>{
        return (
          <div className="auth-in-wrapper w-75 h-100">
            <div className="auth-in-header">
              <h3 className="auth-in-header-title">Temporary Login</h3>
              <p className="auth-in-header-subtitle">
                <span>
                  Enter your actual email and password to access your account to save your userId
                </span>
                <br/>
                <em>
                  - This is neccessary to save the book to your account
                </em>
                <br />

                <em>
                  - Please remember to change them after, if you feel insecure. 
                  <strong> We do not keep any login credentials</strong>
                </em>
              </p>
              </div>
            <Form id="auth-in" onSubmit={handleAuth}>
              <FormGroup id="formBasicEmail">
                <Label>Email address</Label>
                <Input form='auth-in' name="email" type="email" placeholder="Enter email" />
              </FormGroup>
              <FormGroup id="formBasicPassword">
                <Label>Password</Label>
                <Input form='auth-in' name="password" type="password" placeholder="Password" />
              </FormGroup>
              <Button color="primary" type="submit">
                Submit
              </Button>

            </Form>
          </div>
        )
      };

      const MemoizedIframe = memo(
        ({authedIn,targetUrlSet, ...props }) => {

          return (
            authedIn ? targetUrlSet ? (
              <>
                <iframe
                  id='iframe_iframe'
                  src='https://progressme.ru/TeacherAccount/lesson-preview?bookId=77129&lessonId=701806&sectionId=3294846'
                  frameBorder='0'
                  allowFullScreen={true}
                  className='iframe_iframe w-100 h-100'
                  onLoad={disableLogs}
                  
                >

                </iframe>
              </>
            ) : <IntermediateComponent/>
            : (
              <AuthIn />
            )
        )
        }
      );

      const LoadLink = () =>(
        <Form id="load-link" className='w-100 ' onSubmit={handleClick}>
          <FormGroup className='w-100' >
            <Input
              type="text"
              placeholder="progressme link"
              
              defaultValue={targetUrl || ""}
            />
            <Col>
              <Button
                  className="btn-semi-round"
                  color="primary"
                  type="submit"
                >
                  connect
              </Button>
              <Button
                  className="btn-semi-round"
                  color="danger"
                  type="button"
                  onClick={(e)=>handleReset(e)}
                >
                  reset
              </Button>
            
            </Col>
          </FormGroup>  
        </Form>
      );

      return (
          <Row className='my-4' style={{height:"800px", maxHeight:"1000px"}} >
            <Col lg="12 " className='h-100'>
              <Card className='h-100'>
                <CardHeader>
                  <CardTitle tag="h5">Add the progressme link</CardTitle>
                </CardHeader>
                <CardBody className='p-4 h-100'  >
                  <Row className='h-100 w-100 overflow-hidden' >
                    <Col >
                      <Row lg={"10"}>
                        <LoadLink/>
                      </Row>
                      <Row lg={"10"} className='h-100'>
                        <div className='iframe_wrapper w-100 h-100'>
                          <MemoizedIframe authedIn={isAuthed} targetUrlSet={targetUrlSet()}/>
                        </div>
                      </Row>
                    </Col>
                    <Col sm="3"> 
                    {
                      isAuthed ? (
                        <SocketComponent onSave={handleSave}/>
                        
                      )
                      : <Form id="disabled-save-book">
                        <FormGroup className='w-100 '>
                          <Input
                            className='mb-1'
                            type="text"
                            id="disabled-book-id"
                            readOnly
                            defaultValue={ "book id"}
                          />
                          <Input
                            className='my-1'
                            type="text"
                            id="disabled-book-name"
                            readOnly
                            defaultValue={"book name"}
                          />
                          <Input
                            className='mt-1'
                            type="text"
                            id="disabled-user-id"
                            readOnly
                            defaultValue={"user name"}
                          />
                          <Button
                              className="btn-semi-round"
                              color="primary"
                              type="button"
                              disabled
                              onClick={(e)=>""}
                            >
                              save
                            </Button>
                        </FormGroup>
                      </Form>
                    }
                    </Col>
                  </Row>


                </CardBody>
              </Card>
            </Col>
          </Row>


      )
};

export default memo(Scrapper);