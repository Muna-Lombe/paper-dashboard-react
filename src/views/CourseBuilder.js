import React from 'react';
import { Row, Col } from 'reactstrap';
import CourseBuilderComponent from '../components/Progressme/CourseBuilder';

const CourseBuilder = () => {
  return (
    <div className="content">
      <Row>
        <Col>
          <CourseBuilderComponent />
        </Col>
      </Row>
    </div>
  );
};

export default CourseBuilder;
