
import Scrapper from "../components/Progressme/CourseScraper";
import DisplayNotification from "../components/Headers/DisplayNotification";
import Whatsbot from "../components/Whatsbot";
import React from "react";
// react plugin used to create charts

// reactstrap components
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
} from "reactstrap";
// core components
import {
  dashboard24HoursPerformanceChart,
  dashboardEmailStatisticsChart,
  dashboardNASDAQChart,
} from "variables/charts.js";
import Progressme from "../components/Progressme";

function Dashboard() {

  return (
    <>
        <div className="content" style={{height:'auto'}}>
          <Row>
            <Col lg="3" md="6" sm="6">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <div className="icon-big text-center icon-warning">
                        <i className="nc-icon nc-globe text-warning" />
                      </div>
                    </Col>
                    <Col md="8" xs="7">
                      <div className="numbers">
                        <p className="card-category">Capacity</p>
                        <CardTitle tag="p">150GB</CardTitle>
                        <p />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="stats">
                    <i className="fas fa-sync-alt" /> Update Now
                  </div>
                </CardFooter>
              </Card>
            
            </Col>
            <Col lg="3" md="6" sm="6">
              <Whatsbot  />
            </Col>
            
          </Row>
         
          <Progressme/>
          
        </div>

    </>
  );
}

export default Dashboard;
