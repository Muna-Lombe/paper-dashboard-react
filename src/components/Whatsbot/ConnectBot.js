import React from 'react';
import {Button, Card, CardImg, CardBody, CardText } from 'reactstrap';
import botImg from '../../assets/img/bot-landing.png'
const ConnectBot = ({stage, qrcode, handler}) => {


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
            onClick={(e) => handler(e)}
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
  const RefreshState = () =>(
    <>
      <CardBody>
        <CardImg
          src={qrcode}
          style={{
            width: "377px",
            aspectRatio: "1/1"
          }}
          top
          width="100%"
        />
        <CardText>
          <h3>Refresh QR Code</h3>
        </CardText>

  
      </CardBody>
    </>
  )
  const ConnectingState = () =>(
    <>
      <CardImg
        src={qrcode}
        style={{
          width:"377px",
          aspectRatio: "1/1"
        }}
        top
        width="100%"
      />
      <CardBody>
        <CardText>
            Scan the QR Code to register your bot
        </CardText>
      </CardBody>
    </>
  )
  return (
    <Card className="card-stats connect-state">
      {
        stage==="getQr" ? <UnconnectedState/> : <ConnectingState/>
      }
    </Card>
  )
}

export default ConnectBot