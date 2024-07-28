import React, { useEffect, useState } from 'react';
import {Button, Card, CardImg, CardBody, CardText } from 'reactstrap';
import botImg from '../../assets/img/bot-landing.png'
const ConnectBot = ({stage, qrcode, handlerBotConnect, handleQrRefresh}) => {


  
  
  const UnconnectedState = () =>(
     <>
      <CardBody
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '377px',
          width: '377px',
          position: 'relative',
          padding: '1rem'

        }}
      >
        <CardImg
          src={botImg}
          className='bg-img'
          style={{
            height:'100%',
            width:"100%",
            aspectRatio: "1/1"
          }}
          top
          alt='Card image cap'
        />
        <CardText
          style={{
            position:'absolute',
            display:'flex',
            justifyContent: 'center',
            alignItems: 'center',
            inset: '1',
            width:'90%',
            aspectRatio:'1/1',
            borderRadius: "10px",
            // height:'100%',
            backgroundColor:'rgb(30, 41, 59, 0.6)'
          }}
        >
          <Button
            onClick={(e) => handlerBotConnect(e)}
            color="primary"
            style={{
              width: 'max-content',
              height: 'max-content',
              
            }}
          >
            Connect Bot
          </Button>

        </CardText>
      </CardBody>
    </>
    
  )
  
  // const RefreshState = () =>(
  //   <>
  //     <CardBody
      
  //       style={{
  //         display: 'hidden',
  //         position: 'relative',
  //         backgroundImage: '#0000',
  //         backgroundSize: 'cover',
  //         width: "377px",
  //         aspectRatio: "1/1"
  //       }}
  //     >
  //       <CardImg
  //         src={qrcode}
  //         style={{
  //           // position: 'absolute',
  //           width: "100%",
  //           aspectRatio: "1/1",
  //         }}
  //         top="0"
  //         width="100%"
  //       />
  //       <CardText
  //        style={{
  //         position: 'absolute',
  //         width: "377px",
  //         aspectRatio: "1/1",
  //         backgroundColor:"rgba(0,0,0,0.7)",
  //         display:"flex",
  //         justifyContent:'center',
  //         alignItems:"center",
  //         top:"0",
  //         left:"0",
  //         borderRadius:"13px",

          

  //        }}
  //       >
  //         <h3
  //           style={{
  //             color: "white",
  //             fontWeight: "bold",
  //             fontSize: "1.5rem",
  //             // backgroundColor: "rgba(0,0,0,0.5)",
  //             display: "flex",
  //             flexDirection:"column",
  //             justifyContent: 'center',
  //             alignItems:"center"
  //           }}
  //         >
  //           <span>
  //             Refresh QR Code
  //           </span>
  //           <span onClick={(e) => handleQrRefresh(e)}>
  //             <i className='fas fa-sync-alt btn btn-md ' />
  //           </span>
          
  //         </h3>
  //       </CardText>

  //     </CardBody>
  //   </>
  // )


  const ScanCodeState =()=>{
    // const [refresh, setRefresh] = useState(false)
    
    const UnrefreshState = () =>(
      <>
        <CardBody>
          <CardImg
            src={qrcode}
            style={{
              display:"flex",
              width:"377px",
              aspectRatio: "1/1"
            }}
            top
            width="100%"
          />
          <CardText 
            id="no-refresh"
            style={{
              color: "black",
              fontWeight: "bold",
              fontSize: "1.0rem",
              // backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: 'center',
              alignItems:"center"
            }}
          >
              Scan the QR Code to register your bot
          </CardText>
          {/* <CardText
            id="refresh"
            style={{
              display:"hidden",
              position: 'absolute',
              width: "377px",
              aspectRatio: "1/1",
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: 'center',
              alignItems: "center",
              top: "0",
              left: "0",
              borderRadius: "13px",



            }}
          >
            <h3
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "1.5rem",
                // backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                justifyContent: 'center',
                alignItems: "center"
              }}
            >
              <span>
                Refresh QR Code
              </span>
              <span onClick={(e) => handleQrRefresh(e)}>
                <i className='fas fa-sync-alt btn btn-md ' />
              </span>

            </h3>
          </CardText> */}
        </CardBody>
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
    <Card className="card-stats connect-state">
      {
        stage==="disconnected" ? <UnconnectedState/> : <ScanCodeState/>
      }
    </Card>
  )
}

export default ConnectBot