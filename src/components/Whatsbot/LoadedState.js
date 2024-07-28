import React from 'react'
import { Button, Card, CardImg, CardBody, CardText } from 'reactstrap'
import botImg from '../../assets/img/bot-landing.png'

const LoadedState = () => {
  return (
    <Card className="card-stats loaded-state" style={{width:"377px", aspectRatio:"1/1"}}>
      <CardImg
        src={botImg}
        style={{
          aspectRatio: "1/1"
        }}
        top
        width="100%"
      />
      <CardBody>
        <CardText>
          Bot is connected
        </CardText>
      </CardBody>
    </Card>
  )
}

export default LoadedState;