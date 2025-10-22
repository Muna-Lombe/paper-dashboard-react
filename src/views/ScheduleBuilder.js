import React from 'react';
import { Row, Col } from 'reactstrap';
import ScheduleBuilderComponent from '../components/Progressme/ScheduleBuilderV9';

const ScheduleBuilder = () => {
  return (
    <div className="content">
      <Row>
        <Col>
          <ScheduleBuilderComponent />
        </Col>
      </Row>
    </div>
  );
};

export default ScheduleBuilder;
