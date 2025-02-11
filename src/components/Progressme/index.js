import React, { useState } from "react";
import CourseScraper from "./CourseScraper";
import CourseBuilder from "./CourseBuilder";
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
  Label,
} from "reactstrap";
import ScheduleBuilderV1 from "./ScheduleBuilderV1";
import ScheduleBuilderV2 from "./ScheduleBuilderV2";
import ScheduleBuilderV3 from "./ScheduleBuilderV3";
import ScheduleBuilderV4 from "./ScheduleBuilderV4";
import ScheduleBuilderV5 from "./ScheduleBuilderV5";
import ScheduleBuilderV6 from "./ScheduleBuilderV6";
import ScheduleBuilderV7 from "./ScheduleBuilderV7";
import ScheduleBuilderV8 from "./ScheduleBuilderV8";
import ScheduleBuilderV9 from "./ScheduleBuilderV9";

const Progressme = () => {
  const [activeTab, setActivetab] = useState("course-scraper");
  return (
    // build a component with switchable tabs for course builder and course scraper
    // add a button to switch between the two
    <Row className="my-4" style={{ height: "800px", maxHeight: "1000px" }}>
      <Col>
        <h1>Progressme</h1>
        {/* <Button onClick={() => setActivetab(<CourseScraper />)}>Course Scraper</Button>
        <Button onClick={() => setActivetab(<CourseBuilder />)}>Course Builder</Button>
        {activeTab} */}
        <div>
          <ul
            role="tablist"
            className="nav nav-pills-primary nav-pills nav-pills-icons justify-content-start ml-4  py-2 col-8 bg-white "
          >
            <li key={1} className="nav-item">
              <a
                data-toggle="tab"
                role="tab"
                href="#course-scraper"
                className={
                  "nav-link " +
                  (activeTab === "course-scraper" ? " active" : "")
                }
                aria-selected="true"
                onClick={() => setActivetab("course-scraper")}
              >
                <div>
                  <span>
                    <i className="nc-icon nc-umbrella-13"></i> Course Copy{" "}
                  </span>
                </div>
              </a>
            </li>
            <li key={2} className="nav-item">
              <a
                data-toggle="tab"
                role="tab"
                href="#course-builder"
                className={
                  "nav-link" + (activeTab === "course-builder" ? " active" : "")
                }
                onClick={() => setActivetab("course-builder")}
              >
                <div>
                  <span>
                    <i className="nc-icon nc-shop"></i> Course Builder{" "}
                  </span>
                </div>
              </a>
            </li>
            <li key={3} className="nav-item">
              <a
                data-toggle="tab"
                role="tab"
                href="#schedule-builder"
                className={
                  "nav-link" +
                  (activeTab === "schedule-builder" ? " active" : "")
                }
                onClick={() => setActivetab("schedule-builder")}
              >
                <div>
                  <span>
                    <i className="nc-icon nc-shop"></i> Schedule Builder{" "}
                  </span>
                </div>
              </a>
            </li>
          </ul>
          <div className="tab-content tab-space justify-content-center ml-4  py-2 bg-white">
            <div
              id="course-scraper"
              className={
                "tab-pane" + (activeTab === "course-scraper" ? " active" : "")
              }
              style={{ display: "auto;" }}
            >
              <CourseScraper />
            </div>
            <div
              id="course-builder"
              className={
                "tab-pane" + (activeTab === "course-builder" ? " active" : "")
              }
              style={{ display: " none;" }}
            >
              {/* <CourseBuilder /> */}
              <div className="justify-content-start ml-4 w-100  py-2 col-8 bg-white rounded-md ">
                <h3> Section Under Construction ⚠</h3>
                <p> Check back in a couple of weeks</p>
              </div>
            </div>
            <div
              id="schedule-builder"
              className={
                "tab-pane" + (activeTab === "schedule-builder" ? " active" : "")
              }
              style={{ display: " none;" }}
            >
              <ScheduleBuilderV9 />
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Progressme;
