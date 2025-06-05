import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addError } from "variables/slices/errorSlice";
import { useSelector, useDispatch } from "react-redux";

// reactstrap components
import {
  Button,
  Card,
  Form,
  Input,
  NavLink,
  Row,
  Col,
  UncontrolledTooltip,
} from "reactstrap";
import { endpoints } from "@/config";
import useAuth from "variables/hooks/useAuth";

function SignInPage({ handleFormSubmit }) {
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
          <Col className="ml-auto mr-auto " md={8}>
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
                    onClick={(e) => handleFormSubmit(e)}
                  >
                    Authenticate
                  </Button>
                </div>
              </Form>
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

function AuthenticationPage() {
  const location = useNavigate();
  const dispatch = useDispatch();
  const { basenames } = useSelector((state) => state.basenames);
  const { authenticateUser } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = document.forms["signin-form"];
    const formData = Object.fromEntries([...new FormData(form)]);
    const { authToken } = formData;

    authenticateUser(authToken);

    return;
  };
  return (
    <div className="content">
      <Row>
        <Col className="ml-auto mr-auto " md={8}>
          <SignInPage handleFormSubmit={handleFormSubmit} />
        </Col>
      </Row>
      {/* </Container> */}
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
