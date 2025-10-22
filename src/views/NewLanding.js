import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody
} from 'reactstrap';
import '../assets/css/landing.css';

const NewLanding = () => {
  return (
    <div className="landing-page">
      <nav className="landing-navbar">
        <Container>
          <div className="navbar-content">
            <div className="brand">
              <h2 className="brand-name">MoorHouse</h2>
            </div>
            <div className="nav-actions">
              <Link to="/auth">
                <Button color="primary" className="nav-button">Get Started</Button>
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>

        <Container className="hero-container">
          <Row className="align-items-center">
            <Col lg="6" className="hero-content">
              <h1 className="hero-title">
                Manage Your Tutoring
                <span className="gradient-text"> Like Never Before</span>
              </h1>
              <p className="hero-subtitle">
                Efficiently organize your course preparations and student
                interactions with our powerful tools. Scrape courses, build
                schedules, and automate communication.
              </p>
              <div className="hero-buttons">
                <Link to="/auth">
                  <Button color="primary" size="lg" className="hero-button primary">
                    Get Started Free
                  </Button>
                </Link>
                <Button color="secondary" size="lg" outline className="hero-button secondary">
                  Learn More
                </Button>
              </div>
            </Col>
            <Col lg="6" className="hero-image-col">
              <div className="hero-image-container">
                <div className="floating-card card-1">
                  <div className="card-icon blue">
                    <i className="nc-icon nc-book-bookmark"></i>
                  </div>
                  <div className="card-content">
                    <h4>250+</h4>
                    <p>Courses</p>
                  </div>
                </div>
                <div className="floating-card card-2">
                  <div className="card-icon green">
                    <i className="nc-icon nc-chart-bar-32"></i>
                  </div>
                  <div className="card-content">
                    <h4>95%</h4>
                    <p>Success Rate</p>
                  </div>
                </div>
                <div className="floating-card card-3">
                  <div className="card-icon orange">
                    <i className="nc-icon nc-single-02"></i>
                  </div>
                  <div className="card-content">
                    <h4>1000+</h4>
                    <p>Students</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="features-section">
        <Container>
          <div className="section-header text-center">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to manage your tutoring business effectively
            </p>
          </div>

          <Row className="features-grid">
            <Col lg="4" md="6" className="feature-col">
              <Card className="feature-card">
                <CardBody>
                  <div className="feature-icon purple">
                    <i className="nc-icon nc-tap-01"></i>
                  </div>
                  <h3 className="feature-title">Course Scraper</h3>
                  <p className="feature-description">
                    Effortlessly gather top-tier educational content from various
                    sources. Save time and focus on teaching.
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="4" md="6" className="feature-col">
              <Card className="feature-card">
                <CardBody>
                  <div className="feature-icon blue">
                    <i className="nc-icon nc-settings-gear-65"></i>
                  </div>
                  <h3 className="feature-title">Course Builder</h3>
                  <p className="feature-description">
                    Customize lessons to meet each student's unique needs with our
                    intuitive course building tools.
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="4" md="6" className="feature-col">
              <Card className="feature-card">
                <CardBody>
                  <div className="feature-icon green">
                    <i className="nc-icon nc-calendar-60"></i>
                  </div>
                  <h3 className="feature-title">Schedule Builder</h3>
                  <p className="feature-description">
                    Create and manage your teaching schedule efficiently. Never
                    miss a session with smart reminders.
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="4" md="6" className="feature-col">
              <Card className="feature-card">
                <CardBody>
                  <div className="feature-icon orange">
                    <i className="nc-icon nc-chat-33"></i>
                  </div>
                  <h3 className="feature-title">Bot Integration</h3>
                  <p className="feature-description">
                    Automate communication with students through our intelligent
                    bot system. Save time on routine tasks.
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="4" md="6" className="feature-col">
              <Card className="feature-card">
                <CardBody>
                  <div className="feature-icon red">
                    <i className="nc-icon nc-chart-pie-36"></i>
                  </div>
                  <h3 className="feature-title">Analytics</h3>
                  <p className="feature-description">
                    Track student progress and performance with comprehensive
                    analytics and reporting tools.
                  </p>
                </CardBody>
              </Card>
            </Col>

            <Col lg="4" md="6" className="feature-col">
              <Card className="feature-card">
                <CardBody>
                  <div className="feature-icon teal">
                    <i className="nc-icon nc-lock-circle-open"></i>
                  </div>
                  <h3 className="feature-title">Secure & Private</h3>
                  <p className="feature-description">
                    Your data is encrypted and secure. We prioritize your privacy
                    and that of your students.
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-shape shape-1"></div>
          <div className="cta-shape shape-2"></div>
        </div>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg="8">
              <h2 className="cta-title">Ready to Transform Your Tutoring?</h2>
              <p className="cta-subtitle">
                Join hundreds of tutors who are already using MoorHouse to
                streamline their workflow and improve student outcomes.
              </p>
              <Link to="/auth">
                <Button color="primary" size="lg" className="cta-button">
                  Start Free Trial
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      <footer className="landing-footer">
        <Container>
          <Row>
            <Col md="6">
              <h5 className="footer-brand">MoorHouse</h5>
              <p className="footer-text">
                Revolutionizing the way tutors manage their courses and students.
              </p>
            </Col>
            <Col md="6" className="text-md-end">
              <p className="footer-copyright">
                © {new Date().getFullYear()} MoorHouse. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default NewLanding;
