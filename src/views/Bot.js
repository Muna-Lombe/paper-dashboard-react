import React from 'react';
import { Row, Col } from 'reactstrap';
import BotComponent from '../components/Whatsbot';

const Bot = () => {
  return (
    <div className="content">
      <Row>
        <Col>
          <BotComponent />
        </Col>
      </Row>
    </div>
  );
};

export default Bot;
