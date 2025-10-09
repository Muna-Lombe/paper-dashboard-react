
import React, { useState } from "react";
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
// core components
import CourseScraperV2 from "../components/Progressme/CourseScraperv2";
import CourseBuilder from "../components/Progressme/CourseBuilder";
import ScheduleBuilderV9 from "../components/Progressme/ScheduleBuilderV9";
import DisplayNotification from "../components/Headers/DisplayNotification";
import classnames from 'classnames';

function Dashboard() {
  const [activeTab, setActiveTab] = useState("course-scraper");

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <DisplayNotification />
          </Col>
        </Row>
        <Row>
          <Col lg="12" md="12" sm="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">Progressme Tools</CardTitle>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'course-scraper' })}
                      onClick={() => { toggle('course-scraper'); }}
                    >
                      Course Copy
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'course-builder' })}
                      onClick={() => { toggle('course-builder'); }}
                    >
                      Course Builder
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'schedule-builder' })}
                      onClick={() => { toggle('schedule-builder'); }}
                    >
                      Schedule Builder
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardHeader>
              <CardBody>
                {activeTab === "course-scraper" && <CourseScraperV2 />}
                {activeTab === "course-builder" && (
                  <div className="justify-content-start ml-4 w-100 py-2 col-8 bg-white rounded-md">
                    <h3> Section Under Construction ⚠</h3>
                    <p> Check back in a couple of weeks</p>
                  </div>
                )}
                {activeTab === "schedule-builder" && <ScheduleBuilderV9 />}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="12" md="12" sm="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">Quick Actions</CardTitle>
              </CardHeader>
              <CardBody>
                {/* Placeholder for quick action buttons */}
                <p>Add quick action buttons here.</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
