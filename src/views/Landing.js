import React from 'react'

// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Jumbotron,
} from 'reactstrap'

// core components
import ExamplesNavbar from 'components/Navbars/DemoNavbar.js'
import LandingPageHeader from 'components/Headers/LandingPageHeader.js'
import DemoFooter from 'components/Footer/Footer.js'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

// function LandingPage () {
  
//   const { basenames } = useSelector(state => state.basenames)

//   document.documentElement.classList.remove('nav-open')
//   React.useEffect(() => {
//     document.body.classList.add('profile-page')
//     return function cleanup () {
//       document.body.classList.remove('profile-page')
//     }
//   })
//   return (
//     <div>
//       {/* Hero Section */}
//       <Jumbotron
//         fluid
//         className='text-center text-white d-flex align-items-center'
//         style={{
//           height: '100vh',
//           backgroundImage: 'url(/path-to-teacher-background.jpg)',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           position: 'relative',
//           overflow: 'hidden'
//         }}
//       >
//         {/* Overlay with Bright Colors and Shapes */}
//         <div
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             background: 'rgba(0, 123, 255, 0.7)',
//             clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
//           }}
//         ></div>

//         <Container style={{ position: 'relative', zIndex: 1 }}>
//           <h1 className='display-3'>MoorHouse Tutor CRM</h1>
//           <p className='lead'>Revolutionize Your Tutoring Experience</p>
//           <div className='mt-5'>
//             <a href='#buttons' className='btn btn-outline-light btn-lg'>
//               Scroll Down
//             </a>
//           </div>
//         </Container>
//       </Jumbotron>

//       {/* Buttons Section */}
//       <section id='buttons' className='py-5' style={{ backgroundColor: '#f8f9fa' }}>
//         <Container className='text-center'>
//           <Row>
//             <Col md={{ size: 6, offset: 3 }}>
//               <Link to="/admin/dashboard" >
//                 <Button
//                   color='success'
//                   size='lg'
//                   className='mx-2 mb-3'
//                   href='/dashboard'
//                 >
//                   Go to Dashboard
//                 </Button>
              
//               </Link>
//               <Button
//                 color='info'
//                 size='lg'
//                 className='mx-2 mb-3'
//                 href='#learn-more'
//               >
//                 Learn More
//               </Button>
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       {/* Introduction Section */}
//       <section id='learn-more' className='py-5'>
//         <Container>
//           <Row className='align-items-center'>
//             <Col md='6'>
//               <img
//                 src='/path-to-teacher-student.jpg'
//                 alt='Teacher with Students'
//                 className='img-fluid rounded shadow'
//               />
//             </Col>
//             <Col md='6'>
//               <h2 className='mb-4'>About MoorHouse Tutor CRM</h2>
//               <p>
//                 MoorHouse Tutor CRM is an innovative platform designed to empower
//                 tutors in managing their course preparations and student engagements
//                 more effectively. With our intuitive course scraper, you can gather
//                 top-tier educational content effortlessly. The customizable course
//                 builder allows you to tailor lessons to meet each student's unique
//                 needs. Enhance your tutoring services with powerful tools and a
//                 user-friendly interface.
//               </p>
//             </Col>
//           </Row>
//         </Container>
//       </section>
//     </div>

//   );

//   return (
//     <>
//       {/* <ExamplesNavbar isAuthed={false}/> */}
//       {/* <LandingPageHeader /> */}
//       <div className='main'>
//         <div
//           style={{
//             backgroundImage:
//               "url(" + require("assets/img/daniel-olahh.jpg") + ")",
//           }}
//           className="section landing-page"
          
//         >
    
//           <Container>
//             <Row>
//               <Col>
//                 <div className="motto text-center">
//                   <h1>MoorHouse CRM</h1>
//                   <h3>Start managing your clients better Today!</h3>
//                   <br />
//                   <Link to="/admin/dashboard" >
//                     <Button
//                       // href={(basenames[0]||"")+"/sign-in"}
//                       className="btn-round mr-1"
//                       color="dark"
//                       target="_blank"
//                       outline
//                     >
                      
//                       Get Started
//                     </Button>
//                   </Link>
//                   <Button 
//                   href={(basenames[0]||"")+"/landing#product-section"}
//                     className="btn-round" color="neutral" 
//                     type="button" 
//                     outline
//                   >
//                     Read More
//                   </Button>
//                 </div>
//               </Col>
              
//             </Row>
            
//           </Container>
//         </div>
//         <section id="product-section">
//           <div className='section product-section text-center'>
//             <Container>
//               <Row>
//                 <Col className="ml-auto mr-auto" md={6} >
//                     <h2 className='title'>Let's talk product</h2>
//                     <h5 className='description'>
//                       This is the paragraph where you can write more details about
//                       your product. Keep you user engaged by providing meaningful
//                       information. Remember that by this time, the user is curious,
//                       otherwise he wouldn't scroll to get here. Add a button if you
//                       want the user to see more.
//                     </h5>
//                     <br />
//                     <Button
//                       className='btn-round'
//                       color='info'
//                       href={(basenames[0]||"")+'/landing#pablo'}
//                       onClick={e => e.preventDefault()}
//                     >
//                       See Details
//                     </Button>
//                   </Col>
//               </Row>
//               <br />
//               <br />
//               <Row>
//                 <Col md='3'>
//                   <div className='info'>
//                     <div className='icon icon-info'>
//                       <i className='nc-icon nc-album-2' />
//                     </div>
//                     <div className='description'>
//                       <h4 className='info-title'>Beautiful Gallery</h4>
//                       <p className='description'>
//                         Spend your time generating new ideas. You don't have to
//                         think of implementing.
//                       </p>
//                       <Button className='btn-link' color='info' href={(basenames[0]||"")+'/landing#pablo'}>
//                         See more
//                       </Button>
//                     </div>
//                   </div>
//                 </Col>
//                 <Col md='3'>
//                   <div className='info'>
//                     <div className='icon icon-info'>
//                       <i className='nc-icon nc-bulb-63' />
//                     </div>
//                     <div className='description'>
//                       <h4 className='info-title'>New Ideas</h4>
//                       <p>
//                         Larger, yet dramatically thinner. More powerful, but
//                         remarkably power efficient.
//                       </p>
//                       <Button className='btn-link' color='info' href={(basenames[0]||"")+'/landing#pablo'}>
//                         See more
//                       </Button>
//                     </div>
//                   </div>
//                 </Col>
//                 <Col md='3'>
//                   <div className='info'>
//                     <div className='icon icon-info'>
//                       <i className='nc-icon nc-chart-bar-32' />
//                     </div>
//                     <div className='description'>
//                       <h4 className='info-title'>Statistics</h4>
//                       <p>
//                         Choose from a veriety of many colors resembling sugar
//                         paper pastels.
//                       </p>
//                       <Button className='btn-link' color='info' href={(basenames[0]||"")+'/landing#pablo'}>
//                         See more
//                       </Button>
//                     </div>
//                   </div>
//                 </Col>
//                 <Col md='3'>
//                   <div className='info'>
//                     <div className='icon icon-info'>
//                       <i className='nc-icon nc-sun-fog-29' />
//                     </div>
//                     <div className='description'>
//                       <h4 className='info-title'>Delightful design</h4>
//                       <p>
//                         Find unique and handmade delightful designs related items
//                         directly from our sellers.
//                       </p>
//                       <Button className='btn-link' color='info' href={(basenames[0]||"")+'/landing#pablo'}>
//                         See more
//                       </Button>
//                     </div>
//                   </div>
//                 </Col>
//               </Row>
//             </Container>
//           </div>

//         </section>
//         <section id="us-section">
//           <div className='section us-section section-dark text-center'>
//             <Container>
//               <h2 className='title'>Let's talk about us</h2>
//               <Row>
//                 <Col md='4'>
//                   <Card className='card-profile card-plain'>
//                     <div className='card-avatar'>
//                       <a href={(basenames[0]||"")+'/landing#pablo'} onClick={e => e.preventDefault()}>
//                         <img
//                           alt='...'
//                           src={require('assets/img/faces/clem-onojeghuo-3.jpg')}
//                         />
//                       </a>
//                     </div>
//                     <CardBody>
//                       <a href={(basenames[0]||"")+'/landing#pablo'} onClick={e => e.preventDefault()}>
//                         <div className='author'>
//                           <CardTitle tag='h4'>Henry Ford</CardTitle>
//                           <h6 className='card-category'>Product Manager</h6>
//                         </div>
//                       </a>
//                       <p className='card-description text-center'>
//                         Teamwork is so important that it is virtually impossible
//                         for you to reach the heights of your capabilities or make
//                         the money that you want without becoming very good at it.
//                       </p>
//                     </CardBody>
//                     <CardFooter className='text-center'>
//                       <Button
//                         className='btn-just-icon btn-neutral'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-twitter' />
//                       </Button>
//                       <Button
//                         className='btn-just-icon btn-neutral ml-1'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-google-plus' />
//                       </Button>
//                       <Button
//                         className='btn-just-icon btn-neutral ml-1'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-linkedin' />
//                       </Button>
//                     </CardFooter>
//                   </Card>
//                 </Col>
//                 <Col md='4'>
//                   <Card className='card-profile card-plain'>
//                     <div className='card-avatar'>
//                       <a href={(basenames[0]||"")+'/landing#pablo'} onClick={e => e.preventDefault()}>
//                         <img
//                           alt='...'
//                           src={require('assets/img/faces/joe-gardner-2.jpg')}
//                         />
//                       </a>
//                     </div>
//                     <CardBody>
//                       <a href={(basenames[0]||"")+'/landing#pablo'} onClick={e => e.preventDefault()}>
//                         <div className='author'>
//                           <CardTitle tag='h4'>Sophie West</CardTitle>
//                           <h6 className='card-category'>Designer</h6>
//                         </div>
//                       </a>
//                       <p className='card-description text-center'>
//                         A group becomes a team when each member is sure enough of
//                         himself and his contribution to praise the skill of the
//                         others. No one can whistle a symphony. It takes an
//                         orchestra to play it.
//                       </p>
//                     </CardBody>
//                     <CardFooter className='text-center'>
//                       <Button
//                         className='btn-just-icon btn-neutral'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-twitter' />
//                       </Button>
//                       <Button
//                         className='btn-just-icon btn-neutral ml-1'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-google-plus' />
//                       </Button>
//                       <Button
//                         className='btn-just-icon btn-neutral ml-1'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-linkedin' />
//                       </Button>
//                     </CardFooter>
//                   </Card>
//                 </Col>
//                 <Col md='4'>
//                   <Card className='card-profile card-plain'>
//                     <div className='card-avatar'>
//                       <a href={(basenames[0]||"")+'/landing#pablo'} onClick={e => e.preventDefault()}>
//                         <img
//                           alt='...'
//                           src={require('assets/img/faces/erik-lucatero-2.jpg')}
//                         />
//                       </a>
//                     </div>
//                     <CardBody>
//                       <a href={(basenames[0]||"")+'/landing#pablo'} onClick={e => e.preventDefault()}>
//                         <div className='author'>
//                           <CardTitle tag='h4'>Robert Orben</CardTitle>
//                           <h6 className='card-category'>Developer</h6>
//                         </div>
//                       </a>
//                       <p className='card-description text-center'>
//                         The strength of the team is each individual member. The
//                         strength of each member is the team. If you can laugh
//                         together, you can work together, silence isn’t golden,
//                         it’s deadly.
//                       </p>
//                     </CardBody>
//                     <CardFooter className='text-center'>
//                       <Button
//                         className='btn-just-icon btn-neutral'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-twitter' />
//                       </Button>
//                       <Button
//                         className='btn-just-icon btn-neutral ml-1'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-google-plus' />
//                       </Button>
//                       <Button
//                         className='btn-just-icon btn-neutral ml-1'
//                         color='link'
//                         href={(basenames[0]||"")+'/landing#pablo'}
//                         onClick={e => e.preventDefault()}
//                       >
//                         <i className='fa fa-linkedin' />
//                       </Button>
//                     </CardFooter>
//                   </Card>
//                 </Col>
//               </Row>
//             </Container>
//           </div>
//         </section>
//         <section id="cta-section">
//           <div className='section cta-section'>
//             <Container>
//               <Row>
//                 <Col className='ml-auto mr-auto' md='8'>
//                   <h2 className='text-center'>Keep in touch?</h2>
//                   <Form className='contact-form'>
//                     <Row>
//                       <Col md='6'>
//                         <label>Name</label>
//                         <InputGroup>
//                           <InputGroupAddon addonType='prepend'>
//                             <InputGroupText>
//                               <i className='nc-icon nc-single-02' />
//                             </InputGroupText>
//                           </InputGroupAddon>
//                           <Input placeholder='Name' type='text' />
//                         </InputGroup>
//                       </Col>
//                       <Col md='6'>
//                         <label>Email</label>
//                         <InputGroup>
//                           <InputGroupAddon addonType='prepend'>
//                             <InputGroupText>
//                               <i className='nc-icon nc-email-85' />
//                             </InputGroupText>
//                           </InputGroupAddon>
//                           <Input placeholder='Email' type='text' />
//                         </InputGroup>
//                       </Col>
//                     </Row>
//                     <label>Message</label>
//                     <Input
//                       placeholder='Tell us your thoughts and feelings...'
//                       type='textarea'
//                       rows='4'
//                     />
//                     <Row>
//                       <Col className='ml-auto mr-auto' md='4'>
//                         <Button className='btn-fill' color='danger' size='lg'>
//                           Send Message
//                         </Button>
//                       </Col>
//                     </Row>
//                   </Form>
//                 </Col>
//               </Row>
//             </Container>
//           </div>
//         </section>
//       </div>
//       <DemoFooter />
//     </>
//   )
// }
class LandingPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = { isOpen: false }
  }

  toggleNavbar = () => this.setState({ isOpen: !this.state.isOpen })

  render () {
    return (
        <div id=''>
        {/* Navbar */}
          <Navbar
            color='dark'
            dark
            expand='lg'
            fixed='top'
            className='navbar-custom'
          >
            <Container>
              <NavbarBrand href='/' className='logo text-uppercase'>
                MoorHouse Tutor CRM
              </NavbarBrand>
              {/* <NavbarToggler onClick={this.toggleNavbar} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav className='mx-auto' navbar>
                  <NavItem>
                    <NavLink href='#home'>Home</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href='#services'>Services</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href='#features'>Features</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href='#pricing'>Pricing</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href='#contact'>Contact</NavLink>
                  </NavItem>
                </Nav>
                <Nav navbar>
                  <NavItem>
                    <Button color='primary' href='/signup'>
                      Try it Free
                    </Button>
                  </NavItem>
                </Nav>
              </Collapse>*/}
            </Container>
          </Navbar> 

          {/* Hero Section */}
          <section
            id='home'
            className='section bg-home'
            style={{ position: 'relative' }}
          >
            <div className='bg-overlay'></div>
            <Jumbotron
              fluid
              className=' text-center d-flex align-items-center'
              style={{ minHeight: '100vh' }}
            >
              <Container>
                <h1 className='display-4 text-black'>
                  Manage Your Tutoring Like Never Before
                </h1>
                <p className='lead mt-4 text-black'>
                  Efficiently organize your course preparations and student
                  interactions with our powerful tools.
                </p>
                {/* <Button
                  color='primary'
                  size='lg'
                  className='mt-4'
                  href='#buttons'
                >
                  Scroll Down
                </Button> */}
                <Row>
                  <Col>
                    <Link to="/admin/dashboard" >
                      <Button
                        color='success'
                        size='lg'
                        className='mx-2 my-2'
                        href='/dashboard'
                      >
                        Go to Dashboard
                      </Button>
                    
                    </Link>
                    <Button
                      color='info'
                      size='lg'
                      className='mx-2 my-2'
                      href='#learn-more'
                    >
                      Learn More
                    </Button>
                  </Col>
                </Row>
              </Container>
            </Jumbotron>
            {/* Background Pattern */}
            <div className='bg-pattern-effect'>
              {/* You can add SVG or other decorative elements here */}
            </div>
          </section>

          {/* Buttons Section */}
          {/* <section id='buttons' className='py-5'>
            <Container className='text-center'>
              <Row>
                <Col>
                  <Link to="/admin/dashboard" >
                    <Button
                      color='success'
                      size='lg'
                      className='mx-2 my-2'
                      href='/dashboard'
                    >
                      Go to Dashboard
                    </Button>
                  
                  </Link>
                  <Button
                    color='info'
                    size='lg'
                    className='mx-2 my-2'
                    href='#learn-more'
                  >
                    Learn More
                  </Button>
                </Col>
              </Row>
            </Container>
          </section> */}

          {/* Introduction Section */}
          <section id='learn-more' className='section pt-5'>
            <Container>
              <Row className='align-items-center'>
                <Col md='6'>
                  <img
                    src='/images/teacher-student.jpg'
                    alt='Teacher with Students'
                    className='img-fluid rounded shadow'
                  />
                </Col>
                <Col md='6'>
                  <h2 className='mb-4'>About MoorHouse Tutor CRM</h2>
                  <p>
                    MoorHouse Tutor CRM is an innovative platform designed to
                    empower tutors in managing their course preparations and
                    student engagements more effectively. Our service includes:
                  </p>
                  <ul>
                    <li>
                      <strong>Course Scraper:</strong> Gather top-tier educational
                      content effortlessly.
                    </li>
                    <li>
                      <strong>Course Builder:</strong> Customize lessons to meet
                      each student's unique needs.
                    </li>
                  </ul>
                  <p>
                    Enhance your tutoring services with powerful tools and a
                    user-friendly interface that streamlines your workflow.
                  </p>
                </Col>
              </Row>
            </Container>
          </section>

          {/* Footer */}
          <footer className='footer bg-dark text-white pt-5'>
            <Container>
              <Row>
                <Col md='6'>
                  <h5>MoorHouse Tutor CRM</h5>
                  <p className='mt-3'>
                    Revolutionizing the way tutors manage their courses and
                    students.
                  </p>
                </Col>
                <Col md='6' className='text-md-end'>
                  <ul className='list-inline'>
                    <li className='list-inline-item'>
                      <a href='#home' className='text-white'>
                        Home
                      </a>
                    </li>
                    <li className='list-inline-item'>
                      <a href='#services' className='text-white'>
                        Services
                      </a>
                    </li>
                    <li className='list-inline-item'>
                      <a href='#features' className='text-white'>
                        Features
                      </a>
                    </li>
                    <li className='list-inline-item'>
                      <a href='#contact' className='text-white'>
                        Contact
                      </a>
                    </li>
                  </ul>
                </Col>
              </Row>
              <Row className='mt-4'>
                <Col className='text-center'>
                  <p>
                    &copy; {new Date().getFullYear()} MoorHouse Tutor CRM. All
                    rights reserved.
                  </p>
                </Col>
              </Row>
            </Container>
          </footer>
        </div>
    )
  }
}

export default LandingPage
