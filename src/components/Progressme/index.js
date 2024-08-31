import React, { useState } from 'react'
import CourseScraper from './CourseScraper'
import CourseBuilder from './CourseBuilder'
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


const Progressme = () => {
  const [activeTab, setActivetab] = useState("course-scraper")
  return (
    // build a component with switchable tabs for course builder and course scraper
    // add a button to switch between the two
    <Row className='my-4' style={{ height: '800px', maxHeight: '1000px' }}>
      <Col>
        <h1>Progressme</h1>
        {/* <Button onClick={() => setActivetab(<CourseScraper />)}>Course Scraper</Button>
        <Button onClick={() => setActivetab(<CourseBuilder />)}>Course Builder</Button>
        {activeTab} */}
        <div>
          <ul role="tablist" className="nav nav-pills-primary nav-pills nav-pills-icons justify-content-start ml-4  pt-2 pb-0   col-5 bg-white ">
            <li className="nav-item">
              <a data-toggle="tab" role="tab" href="#course-scraper" className={"nav-link "+(activeTab === "course-scraper" ? " active" : "")} aria-selected="true" onClick={()=>setActivetab("course-scraper")}>
                <div>
                  <span><i className="nc-icon nc-umbrella-13"></i> Course Copy </span>
                </div>
              </a>
            </li>
            <li className="nav-item">
              <a data-toggle="tab" role="tab" href="#course-builder" className={"nav-link"+(activeTab === "course-builder" ? " active" : "")} onClick={()=>""}>
                <div>
                  <span><i className="nc-icon nc-shop"></i> Course Builder </span>
                </div>
              </a>
            </li>
          </ul>
          <div className="tab-content tab-space ">
            <div id="course-scraper" className={"tab-pane"+(activeTab === "course-scraper" ? " active" : "")} style={{"display":"auto;"}}> 
              <CourseScraper />
            </div>
            <div id="course-builder" className={"tab-pane"+(activeTab === "course-builder" ? " active" : "")} style={{"display":" none;"}}> 
               {/* <CourseBuilder /> */}
            </div>
            
          </div>
        </div>
      </Col>
    </Row>

    

  )
}

export default Progressme