
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
// import { Form } from 'react-router-dom';
const axios = new Axios()


const Scrapper = () => {
    const [targetUrl, setTargetUrl] = useState('https://progressme.ru/')
    const [authtUrl, setAuthtUrl] = useState('https://progressme.ru/SharingMaterial/c172ca5c-2488-4a14-843f-8caf7c993c79')
    const [isAuthed, setIsAuthed] = useState(false)
    const [socketUrl, setSocketUrl] = useState(
      [
        "wss://books.progressme.ru/websocket?Page=TeacherProfile&isSharing=True&token=",
         "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx?Page=TeacherProfile&isSharing=True&MessageShowToken=3740deac-bf24-43ec-b358-16ef183f7059&token="
      ]
    );
    const [messageHistory, setMessageHistory] = useState([]);
    
    const sess = sessionStorage;
    const sessToken = sess.getItem('token');

 
    const cookie = new Cookie({
      json:true,
      path: '/',
      domain: 'progressme.ru',
      secure: true,

    });

    console.log("rerender counter");
  
    
    const {GetIdMaterialMessage, GetBookMessage, CopySharedBookMessage,GetAuthMessage, GetUserMessage} ={
      GetIdMaterialMessage: {
        "controller":"SharingMaterialWsController","method":"GetIdMaterial",
        "value":`{"Code":"${targetUrl.split("SharingMaterial/")[1]}"}`
      },
      GetBookMessage:(bookId)=>({
        "controller":"SharingMaterialWsController","method":"GetBook",
        "value":`{"BookId":${bookId},"UserId":null}`
      }),
      CopySharedBook:(bookId)=>({
        "controller":"BookWsController","method":"CopyBook",
        "value":`{"BookId":${bookId},"UserId":${2238978}}`
      }),
      GetAuthMessage:{"controller":"Auth","metod":"GetCurrentUser","value":"\"\""},
      GetUserMessage:{"controller":"User","metod":"GetSettingsSource","value":"\"\""}

    }
    const newGuid = ()=> {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }
    const getAuthToken = ()=>{
      sess.getItem('Auth-Token')
      
      if(sess.getItem('Auth-Token')){
        return sess.getItem('Auth-Token')
      }

      sess.setItem('Auth-Token', newGuid()) 
      return sess.getItem('Auth-Token')
    }
    
    const socket0 = useWebSocket(socketUrl[1] + getAuthToken(),{
      protocols: [
        "Cookie"
      ],
      onOpen: () => {
        socket0.sendJsonMessage(GetUserMessage)
      },
      onMessage: (msg) => {
        console.log("socket0 onMessage:", msg.data)
        socket0.getWebSocket().close()
      },
      onClose: () => console.log('closed'),
      shouldReconnect: closeEvent => false
    })

    const socket1 = useWebSocket(socketUrl[0]+getAuthToken(), {
      onOpen: () =>  {socket1.sendJsonMessage(GetIdMaterialMessage)},
      onClose: () => console.log('closed'),
      shouldReconnect: (closeEvent) => false,
      
    });
    
    const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState } = socket1;

    const handleClick = (e) => {
        e.preventDefault();
        console.log(e.target?.[0]?.value);
        
        const url = e.target?.[0]?.value;
        
        setTargetUrl(url.startsWith("https://")? url : "https://www."+url)
    }


    function disableLogs(e){
      e.preventDefault();
      // e.currentTarget.ownerDocument.
      // e.target.contentWindow.postMessage("function(){console.log('logged')}")//.console.log=function (){};
      // console.log(e);
      console.log("disabling logs", e.target.contentWindow);

      
    }
     useEffect(() => {
    
      if (lastJsonMessage !== null) {
        console.log("lastJsonMessage", lastJsonMessage)
        
        if (lastJsonMessage?.Method === "GetIdMaterial" && lastJsonMessage.IsSuccess) {
          // sendJsonMessage(GetBookMessage)
          console.log("material-message:", lastJsonMessage.Value);
          const val = lastJsonMessage.Value;
          
          if(val.BookId){

            document.getElementById("book-id").value=val.BookId
            
            sendJsonMessage(GetBookMessage(val.BookId))
            
          }
          
        }
        if (lastJsonMessage?.Method === "GetBook" && lastJsonMessage.IsSuccess ) {
          console.log('book-message:', lastJsonMessage.Value)
          const val = lastJsonMessage.Value

          document.getElementById('book-name').value = val.Name
            
          
        }
        if (lastJsonMessage?.Method === 'CopyBook' && lastJsonMessage.IsSuccess) {
          console.log('copiedbook-message:', lastJsonMessage.Value)
        }

      }
      return () => {}
    }, [lastJsonMessage]);

    useEffect(() => {
     if (targetUrl){
        const iframe = document.getElementById("iframe_iframe")
        iframe?.setAttribute("src", targetUrl)

     }
    
      return () => {
        // second
      }
    }, [targetUrl])
 
    const handleAuth = async(e)=>{
      e.preventDefault();
      const {email, password} = ((fd)=>({email:fd.get("email"), password:fd.get("password")}))(new FormData(document.forms["auth-in"]));
      // setTimeout(async () => {
        const authUrl = 'https://progressme.ru/Account/Login'
        
        const authBody = {
          "Email": email|| 'dante773@protonmail.com',
          "Password": password || '1901',
          "UserRole": 0,
          "ReturnUrl": '',
          "AuthToken": sess.getItem("Auth-Token")
        }//JSON.stringify();
        // const authBody = [new FormData()].map((fd)=>{
        //   fd.set("Email", email|| 'dante773@protonmail.com');
        //   fd.set("Password", password || '1901');
        //   fd.set("UserRole", '0');
        //   fd.set("ReturnUrl", '');
        //   return fd;
          
        // })[0];
        const authHeaders = new AxiosHeaders(
          // {
          //   "User-Agent": "PostmanRuntime/7.40.0",
          //   "Accept": "application/json",
          //   "Postman-Token": "1794d5dd-3598-4698-9042-b56d5b3e0144",
          //   "Host": "progressme.ru",
          //   "Content-Type": "multipart/form-data; boundary=--------------------------224165945923785312681759",
          //   // "Content-Length": "510"
          // }
        )
        
        // authHeaders.set('Cookie','.AspNetCore.Session=CfDJ8DRAP7zzLARCqZPO0sTZINGiGUnnXvL3ERqOH2h6OCWpuuWs9tHB%2BDS3rm5gBnLiG1qR9Z8qu%2FVG4tcYZrZx1MX%2B84wjGtzOBGVNGWab8VB3ixotF2JC3C0sYU6J30KctTIfPbj7aAKGMb3D%2FmOydjTOnV2lhN43P1V1pLrJxzG4; Auth-Token=20ea3840-b3de-4023-8dbc-fc76731f9b42')
        // authHeaders.set('Cookie','e7afe8e4-a684-491b-af0f-5a2d3e417a1b')
        // authHeaders((v,k,p)=>{
        //   console.log("headers:", k,":",v);
        // })
        Object.entries(          {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://progressme.ru',
          'Referer': 'https://progressme.ru/Account/Login',
          "Cache-Control": "no-cache",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          'User-Agent': 'PostmanRuntime/7.40.0'
          }).forEach(([k,v])=>{
            // console.log("k:", k);
            authHeaders.set(k,v,true)
        })
        
        const res = await fetch(authUrl, {
          // mode: 'no-cors',
          method: 'POST',
          headers: authHeaders.toJSON(),
          body: authBody,
          
        })
        // const data = await res.json()
        // console.log('res:', data)
          

        // sess.setItem('cToken', res.headers.getSetCookie())
        // sess.setItem('userId', data.Value.id)
        // setIsAuthed(ps => !ps)

        // .then(async(res) => {
        //   console.log('res:', res.body, res.headers.getSetCookie())
          
        // })
        // .catch(err => console.log(err))
      // }, 10000)

    }
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
            <FormGroup controlId="formBasicEmail">
              <Label>Email address</Label>
              <Input form='auth-in' name="email" type="email" placeholder="Enter email" />
            </FormGroup>
            <FormGroup controlId="formBasicPassword">
              <Label>Password</Label>
              <Input form='auth-in' name="password" type="password" placeholder="Password" />
            </FormGroup>
            <Button color="primary" type="submit">
              Submit
            </Button>

          </Form>
        </div>
      )
    }
    const MemoizedIframe = memo(
      ({authedIn,...props }) => {
        return (
          authedIn ? (
            <iframe
              id='iframe_iframe'
              src='https://progressme.ru/TeacherAccount/lesson-preview?bookId=77129&lessonId=701806&sectionId=3294846'
              frameBorder='0'
              allowFullScreen={true}
              className='iframe_iframe w-100 h-100'
              onLoad={disableLogs}
            ></iframe>
          ) : (
            <AuthIn />
          )
      )
      }
    )
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
                                onClick={(e)=>{e.preventDefault();setTargetUrl("https://progressme.ru")}}
                              >
                                reset
                            </Button>
                          
                          </Col>
                        </FormGroup>  
                      </Form>
                    </Row>
                    <Row lg={"10"} className='h-100'>
                      <div className='iframe_wrapper w-100 h-100'>
                        <MemoizedIframe authedIn={isAuthed}/>
                      </div>
                    </Row>
                  </Col>
                  <Col sm="3"> 
                    <Form id="save-book">
                      <FormGroup className='w-100 '>
                        <Input
                          className='mb-1'
                          type="text"
                          id="book-id"
                          readOnly
                          defaultValue={"book id"}
                        />
                        <Input
                          className='my-1'
                          type="text"
                          id="book-name"
                          readOnly
                          defaultValue={"book name"}
                        />
                        <Input
                          className='mt-1'
                          type="text"
                          id="user-id"
                          readOnly
                          defaultValue={"user id"}
                        />
                        <Button
                            className="btn-semi-round"
                            color="primary"
                            type="button"
                            disabled
                          >
                            save
                          </Button>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>


              </CardBody>
            </Card>
          </Col>
        </Row>


    )
};

export default memo(Scrapper);