import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col
} from 'reactstrap';
import useSupabaseAuth from '../variables/hooks/useSupabaseAuth';

const NewDashboard = () => {
  const { user } = useSupabaseAuth();

  const stats = [
    {
      title: 'Total Courses',
      value: '12',
      icon: 'nc-icon nc-book-bookmark',
      color: 'blue',
      change: '+3 this week'
    },
    {
      title: 'Active Students',
      value: '45',
      icon: 'nc-icon nc-single-02',
      color: 'green',
      change: '+8 this month'
    },
    {
      title: 'Scheduled Sessions',
      value: '23',
      icon: 'nc-icon nc-calendar-60',
      color: 'orange',
      change: '5 today'
    },
    {
      title: 'Bot Messages',
      value: '156',
      icon: 'nc-icon nc-chat-33',
      color: 'purple',
      change: '+42 today'
    }
  ];

  return (
    <div className="content">
      <Row>
        <Col lg="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">
                Welcome back, {user?.email?.split('@')[0] || 'User'}!
              </CardTitle>
              <p className="card-category">Here's what's happening with your tutoring</p>
            </CardHeader>
          </Card>
        </Col>
      </Row>

      <Row>
        {stats.map((stat, index) => (
          <Col lg="3" md="6" sm="6" key={index}>
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center" style={{
                      background: `linear-gradient(135deg,
                        ${stat.color === 'blue' ? '#4facfe, #00f2fe' :
                          stat.color === 'green' ? '#43e97b, #38f9d7' :
                          stat.color === 'orange' ? '#fa709a, #fee140' :
                          '#667eea, #764ba2'})`,
                      color: 'white',
                      borderRadius: '12px',
                      padding: '15px',
                      fontSize: '2rem'
                    }}>
                      <i className={stat.icon}></i>
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">{stat.title}</p>
                      <CardTitle tag="p">{stat.value}</CardTitle>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {stat.change}
                      </p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col lg="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">Quick Actions</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="3" className="mb-3">
                  <div className="quick-action-card" style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className="nc-icon nc-tap-01" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                    <h5>Course Scraper</h5>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Import courses from ProgressMe</p>
                  </div>
                </Col>
                <Col md="3" className="mb-3">
                  <div className="quick-action-card" style={{
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className="nc-icon nc-settings-gear-65" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                    <h5>Course Builder</h5>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Create custom lessons</p>
                  </div>
                </Col>
                <Col md="3" className="mb-3">
                  <div className="quick-action-card" style={{
                    background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className="nc-icon nc-calendar-60" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                    <h5>Schedule</h5>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Manage your sessions</p>
                  </div>
                </Col>
                <Col md="3" className="mb-3">
                  <div className="quick-action-card" style={{
                    background: 'linear-gradient(135deg, #fa709a, #fee140)',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className="nc-icon nc-chat-33" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                    <h5>Bot</h5>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Automate messaging</p>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NewDashboard;
