import React from 'react';
import { Row, Col } from 'reactstrap';
import CourseScraperComponent from '../components/Progressme/CourseScraper';

const CourseScraper = () => {
  return (
    <div className="content">
      <Row>
        <Col>
          <CourseScraperComponent />
        </Col>
      </Row>
    </div>
  );
};

export default CourseScraper;
