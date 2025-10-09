import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addError } from "variables/slices/errorSlice";
import { useSelector, useDispatch } from "react-redux";
// reactstrap components
import {
  Button,
  Card,
  Form,
  Input,
  NavLink as RSNavLink, // Renamed to avoid conflict with react-router-dom NavLink
  Row,
  Col,
  UncontrolledTooltip,
  Nav,
  NavItem,
}
from "reactstrap";
import { endpoints } from "@/config";
import useAuth from "variables/hooks/useAuth";
import LoginPage from "../components/Auth/LoginPage"; // Import the new LoginPage
import classnames from 'classnames';

function SignInPage({ handleFormSubmit, onLoginSuccess }) {
  document.documentElement.classList.remove("nav-open");
  useEffect(() => {
    document.body.classList.add("register-page");
    return function cleanup() {
      document.body.classList.remove("register-page");
    };
  });

  return (
    <>
      <div className="content">
        <Row>
          <Col className="ml-auto mr-auto " md={8}>
            <Card className="card-register p-4">
              <h3 className="title mx-auto">Welcome</h3>
              <div className="social-line text-center">
              </div>
              <Form id="signin-form" name="signin-form" className="signin-form">
                <label id="authTokenLabel">Authentication Token 🛈</label>
                <UncontrolledTooltip
                  autohide={false}
                  placement="right"
                  target="authTokenLabel"
                >
                  Need a token?
                  <br />
                  <a href="https://t.me/MunaLombe" target="_blank">
                    Contact us on Telegram
                  </a>
                </UncontrolledTooltip>
                <Input
                  form="signin-form"
                  id="authToken"
                  name="authToken"
                  placeholder="Enter your authentication token"
                  type="text"
                  required
                />
                <div className="text-muted small mb-3">
                  Enter your JWT authentication token to access the dashboard.
                </div>
                <div className="">
                  <Button
                    className="btn-round "
                    color="danger"
                    size="sm"
                    type="submit"
                    form="signin-form"
                    onClick={handleFormSubmit}
                  >
                    Authenticate
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

function AuthenticationPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authenticateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("token-login"); // New state for tabs

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    const form = document.forms["signin-form"];
    const formData = Object.fromEntries([...new FormData(form)]);
    const { authToken } = formData;

    const success = await authenticateUser(authToken);
    if (success) {
      navigate("/admin/dashboard"); // Redirect to dashboard on success
    }
  };

  const handleEmailLoginSuccess = (success) => {
    if (success) {
      navigate("/admin/dashboard"); // Redirect to dashboard on success
    } else {
      // Optionally display a generic error or clear form
      dispatch(addError("Login failed. Please check your credentials."));
    }
  };

  return (
    <div className="content">
      <Row>
        <Col className="ml-auto mr-auto " md={8}>
          <Card className="card-register p-4">
            <Nav tabs>
              <NavItem>
                <RSNavLink
                  className={classnames({ active: activeTab === 'token-login' })}
                  onClick={() => { toggleTab('token-login'); }}
                >
                  Token Login
                </RSNavLink>
              </NavItem>
              <NavItem>
                <RSNavLink
                  className={classnames({ active: activeTab === 'email-login' })}
                  onClick={() => { toggleTab('email-login'); }}
                >
                  Email/Password Login
                </RSNavLink>
              </NavItem>
            </Nav>
            <div className="tab-content">
              {activeTab === "token-login" && (
                <SignInPage handleFormSubmit={handleTokenSubmit} />
              )}
              {activeTab === "email-login" && (
                <LoginPage onLoginSuccess={handleEmailLoginSuccess} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
      <div className="footer register-footer text-center">
        <h6>
          © {new Date().getFullYear()}, made with{" "}
          <i className="fa fa-heart heart" /> by MoorHouse Tutoring
        </h6>
      </div>
    </div>
  );
}
export default AuthenticationPage;
