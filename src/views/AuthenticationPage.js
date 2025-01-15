/*!

=========================================================
* Paper Kit React - v1.3.2
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-kit-react

* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/paper-kit-react/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect } from "react";
import {useNavigate} from "react-router-dom";
import { addError } from 'variables/slices/errorSlice'
import { useSelector, useDispatch } from 'react-redux'

// reactstrap components
import { Button, Card, Form, Input, NavLink, Row, Col } from "reactstrap";


function SignInPage({handleFormSubmit, handleAuthState}) {
  document.documentElement.classList.remove("nav-open");
  useEffect(() => {
    document.body.classList.add("register-page");
    return function cleanup() {
      document.body.classList.remove("register-page");
    };
  });
  
  return (
    <>
      {/* <ExamplesNavbar /> */}
      
        <div className="content">
          <Row>
            <Col className="ml-auto mr-auto " md={8} >
              <Card className="card-register p-4">
                <h3 className="title mx-auto">Welcome</h3>
                <div className="social-line text-center">
                  {/* <Button
                    className="btn-neutral-invert btn-just-icon mr-1"
                    color="facebook"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa fa-facebook-square" />
                  </Button>
                  <Button
                    className="btn-neutral-invert btn-just-icon mr-1"
                    color="google"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa fa-google-plus" />
                  </Button>
                  <Button
                    className="btn-neutral-invert btn-just-icon"
                    color="twitter"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa fa-twitter" />
                  </Button> */}
                </div>
                <Form id="signin-form" name="signin-form" className="signin-form">
                  <label>Email/UserId</label>
                  <Input form="signin-form" id="userId" name="userId" placeholder="Email or UserId" type="text" />
                  <label>Password</label>
                  <Input form="signin-form" id="hashedPassword" name="hashedPassword" placeholder="Password" type="password" />
                  <div className="forgot">
                    <div
                      className="btn-link"
                      style={{ 'cursor': 'pointer', 'color': '#007bff' }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Forgot password?
                    </div>
                  </div>
                  <div className="">
                    <Button   
                      className="btn-round " 
                      color="danger"
                      size="sm"
                      // href = '/admin/dashboard'
                      type="submit"
                      form="register-form"
                      onClick={(e) => handleFormSubmit(e)}

                    >
                      Sign In
                    </Button>

                  </div>
                </Form>
                
                <div className="create new account">
                  Don't have an account yet? 
                  <div
                    className="cursor-pointer"
                    style={{'cursor': 'pointer','color': '#007bff'}}
                    onClick={(e) => {
                      e.preventDefault()
                      handleAuthState(false)
                    }}
                  >
                    Create new account
                  </div>
                </div>
                
              </Card>
            </Col>
          </Row>
        {/* </Container> */}
        {/* <div className="footer register-footer text-center">
          <h6>
            © {new Date().getFullYear()}, made with{" "}
            <i className="fa fa-heart heart" /> by Creative Tim
          </h6>
        </div> */}
      </div>
    </>
  );
}

function SignUpPage ({handleFormSubmit, handleAuthState}) {
  document.documentElement.classList.remove('nav-open')
  React.useEffect(() => {
    document.body.classList.add('register-page')
    return function cleanup () {
      document.body.classList.remove('register-page')
    }
  })
  
  return (
    <>
      {/* <ExamplesNavbar /> */}

      
            <Card className='card-register p-4'>
              <h3 className='title mx-auto'>Welcome</h3>
              <div className='social-line text-center'>
                {/* <Button
                    className="btn-neutral-invert btn-just-icon mr-1"
                    color="facebook"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa fa-facebook-square" />
                  </Button>
                  <Button
                    className="btn-neutral-invert btn-just-icon mr-1"
                    color="google"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa fa-google-plus" />
                  </Button>
                  <Button
                    className="btn-neutral-invert btn-just-icon"
                    color="twitter"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fa fa-twitter" />
                  </Button> */}
              </div>
              <Form
                id='signup-form'
                name='signup-form'
                className='signup-form'
              >
                <label>User Id</label>
                <Input
                  form='signup-form'
                  id='userId'
                  name='userId'
                  placeholder='User Id'
                  type='text'
                />
                <label>Email</label>
                <Input
                  form='signup-form'
                  id='email'
                  name='email'
                  placeholder='Email'
                  type='text'
                />
                <div>
                  <div>
                    <label>First Name</label>
                    <Input
                      form='signup-form'
                      id='firstName'
                      name='firstName'
                      placeholder='First Name'
                      type='text'
                    />
                  </div>
                  <div>
                    <label>Last Name</label>
                    <Input
                      form='signup-form'
                      id='lastName'
                      name='lastName'
                      placeholder='Last Name'
                      type='text'
                    />
                  </div>
                </div>
                <label>Password</label>
                <Input
                  form='signup-form'
                  id='hashedPassword'
                  name='hashedPassword'
                  placeholder='Password'
                  type='password'
                />
                <Button
                  className='btn-round '
                  color='danger'
                  // href = '/admin/dashboard'
                  type='submit'
                  form='signup-form'
                  onClick={e => handleFormSubmit(e)}
                >
                  Register
                </Button>
              </Form>
              <div className="signin account">
                  Already have an account? 
                  <NavLink
                    className=""
                    style={{'cursor': 'pointer','color': '#007bff'}}
                    onClick={(e) => {
                      e.preventDefault()
                      handleAuthState(true)
                    }}
                  >
                    Log in to your account
                  </NavLink>
                </div>
            </Card>
          
    </>
  )
}
function AuthenticationPage(){
  const [isSignIn, setIsSignIn] = React.useState(true);
  const location = useNavigate()
  const dispatch = useDispatch()
  const { basenames } = useSelector(state => state.basenames)

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const form = document.forms[isSignIn ? "signin-form":"signup-form"]
    const formData = Object.fromEntries([...(new FormData(form))])
    const {userId, ...rest} = formData;
    rest[((userId.includes("@") && !rest.email) ? "email" : "userId")] = userId;
    const data = rest;
   

    const url = isSignIn ? "http://localhost:5000/api/auth/login" : "http://localhost:5000/api/auth/register";
    const res = await fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": ""//"Bearer " + (localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibW9vcmhvdXNlRU5UIiwiaWF0IjoxNzEwNzEzMTkzfQ.5_SXADx6j1mdAvpX7MDFx5CrlZ_HeWkXdMrKbVm1zmI")
          },
          body: JSON.stringify(data)
        }
      )
      .then(res=> res)
      .catch(err=>({json:async()=>({status: 500, message:"Connection error!\n Please retry in a minute."})}))
      console.log("res", res)
    const resData = await res.json()
    if(resData.status !==200){
      // alert(resData.message)
      dispatch(addError(resData.message))

      
    }
    if(resData.status === 200 &&resData?.sessionKey){

      sessionStorage.setItem("Auth-Token", resData?.sessionKey);
      location((basenames[0]||"")+"/admin/dashboard")
    }

    return;

  }
  return (
    <div className='content'>
      <Row>
        <Col className='ml-auto mr-auto ' md={8}>
          {
            isSignIn ? 
              <SignInPage handleFormSubmit={handleFormSubmit} handleAuthState={setIsSignIn}/> 
              : <SignUpPage handleFormSubmit={handleFormSubmit} handleAuthState={setIsSignIn}/>
          }
        </Col>
      </Row>
      {/* </Container> */}
      <div className='footer register-footer text-center'>
        <h6>
          © {new Date().getFullYear()}, made with{' '}
          <i className='fa fa-heart heart' /> by MoorHouse Tutoring
        </h6>
      </div>
    </div>

      
  
  )
}
export default AuthenticationPage;
