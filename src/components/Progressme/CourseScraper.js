import React, { memo, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Button,
  Spinner,
  FormGroup,
  Form,
  Input,
  Label,
} from "reactstrap";
import axios from "axios";
import { addError } from "../../variables/slices/errorSlice";
import { useDispatch } from "react-redux";
import spirow from "../../assets/img/spriral-arrow.png";
import { endpoints } from "config";

const CourseScraper = () => {
  const [targetUrl, setTargetUrl] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [testUrl, setTestUrl] = useState(
    "https://progressme.ru/SharingMaterial/c172ca5c-2488-4a14-843f-8caf7c993c79",
  );
  const [showLogin, setShowLogin] = useState(false);
  const sess = sessionStorage;
  const dispatch = useDispatch();

  const handleGetBook = async (e, tUrl) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `${endpoints.paperDashApi.getBook.url}?url=${(targetUrl ?? tUrl) || ""}`,
      );
      // console.log("book response", response);
      if (response?.data) {
        sess.setItem("bookId", response.data?.bookId || "nil");
        sess.setItem("bookName", response.data?.bookName || "nil");
      } else {
        dispatch(addError("Book not loaded correctly. Please try again."));
        sess.setItem("bookId", "");
        sess.setItem("bookName", "");
      }
    } catch (error) {
      // console.log(error);
      dispatch(addError(error.response?.data?.msg || "Failed to get  book"));
      sess.setItem("bookId", "");
      sess.setItem("bookName", "");
    }
  };
  const handleLoadLink = async (e, setLinkLoading) => {
    e.preventDefault();
    setLinkLoading(true);

    try {
      const response = await axios.post(
        endpoints.paperDashApi.validateUrl.url,
        {
          url: e.target?.[0]?.value.trim() || "",
        },
      );

      if (response.data.url) {
        await handleGetBook(e, response.data.url);
        setTargetUrl(response.data.url);
        setShowLogin(false);
      } else {
        dispatch(addError("Book link is not correct. Please check."));
        setTargetUrl(testUrl);
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to validate URL"));
      setTargetUrl(testUrl);
    } finally {
      setTimeout(() => setLinkLoading(false), 300);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const bookId = sess.getItem("bookId");
    const userId = sess.getItem("userId");
    const token = sess.getItem("Auth-Token");

    if (!bookId || !userId || !token) {
      dispatch(addError("Missing required information"));
      return;
    }

    try {
      await axios.post(endpoints.paperDashApi.copyCourse.url, {
        bookId,
        userId,
        token,
      });

      setTimeout(() => {
        setTargetUrl("https://progressme.ru/TeacherAccount/materials/personal");
      }, 10000);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to copy course"));
    }
  };

  const handleAuth = async (e, setAuthing) => {
    e.preventDefault();
    setAuthing(true);

    const formData = new FormData(document.forms["auth-in"]);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      // Get a new token if not already set
      if (!sess.getItem("Auth-Token")) {
        const tokenResponse = await axios.get(
          endpoints.paperDashApi.getToken.url,
        );
        sess.setItem("Auth-Token", tokenResponse.data.token);
      }

      // Authenticate with the token
      const response = await axios.post(
        endpoints.paperDashApi.authenticate.url,
        {
          email,
          password,
        },
      );

      // console.log("response from auth", response);

      sess.setItem("userId", response.data.data.Value.Id);

      setIsAuthed(true);
      setShowLogin(false);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Authentication failed"));
    } finally {
      setAuthing(false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    sess.removeItem("bookId");
    sess.removeItem("bookName");
    setTargetUrl("https://progressme.ru");
    setShowLogin(true);
  };

  const hasNoBookUserId = () =>
    !(sess.getItem("bookId")?.length > 0 && sess.getItem("userId")?.length > 0);

  // Components
  const LoadingButton = () => (
    <Button color="primary" disabled>
      <Spinner size="sm">Loading...</Spinner>
      <span> Loading</span>
    </Button>
  );

  const AuthIn = () => {
    const [authing, setAuthing] = useState(false);
    return (
      <div className="auth-in-wrapper w-75 h-100">
        <div className="auth-in-header">
          <h3 className="auth-in-header-title">Temporary Login</h3>
          <p className="auth-in-header-subtitle">
            <span>
              Enter your actual email and password to access your account to
              save your userId
            </span>
            <br />
            <em>- This is necessary to save the book to your account</em>
            <br />
            <em>
              - Please remember to change them after, if you feel insecure.
              <strong> We do not keep any login credentials</strong>
            </em>
          </p>
        </div>
        <Form id="auth-in" onSubmit={(e) => handleAuth(e, setAuthing)}>
          <FormGroup id="formBasicEmail">
            <Label>Email address</Label>
            <Input
              form="auth-in"
              name="email"
              type="email"
              placeholder="Enter email"
              disabled={authing}
            />
          </FormGroup>
          <FormGroup id="formBasicPassword">
            <Label>Password</Label>
            <Input
              form="auth-in"
              name="password"
              type="password"
              placeholder="Password"
              disabled={authing}
            />
          </FormGroup>
          {authing ? (
            <LoadingButton />
          ) : (
            <Button color="primary" type="submit">
              Submit
            </Button>
          )}
        </Form>
      </div>
    );
  };

  const NoTargetUrlSet = () => (
    <div
      className="position-absolute top-100 start-50 translate-middle w-100 overlayer d-flex flex-column justify-content-center align-items-center px-2"
      style={{ inset: 0 }}
    >
      <img src={spirow} className="w-25 scale-x-[-1] rotate-90" alt="arrow" />
      <h4 className="w-75">
        Add the link to your book up here and see the magic
      </h4>
    </div>
  );

  const BookCopied = () => (
    <div
      className="position-absolute top-100 start-50 translate-middle w-100 overlayer d-flex flex-column justify-content-center align-items-center my-5 px-2"
      style={{ inset: 0 }}
    >
      <div className="w-100 h-100">
        <h3>Book Copied!</h3>
        <h5>
          Log in to
          <a
            href="https://progressme.ru/Account/Login"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" progressme.ru "}
            <i className="fas fa-external-link" aria-hidden="true"></i>
          </a>
          to see the book in your personal library
        </h5>
      </div>
    </div>
  );

  const LoadLink = ({ setLinkLoading }) => (
    <Form
      id="load-link"
      className="w-75"
      onSubmit={(e) => handleLoadLink(e, setLinkLoading)}
    >
      <FormGroup className="w-100">
        <Input
          type="text"
          placeholder="progressme link"
          defaultValue={targetUrl || ""}
          className="form-control"
        />
        <div className="invalid-feedback">
          Please check the link and make sure there are no spaces.
        </div>
        <Col>
          <Button className="btn-semi-round" color="primary" type="submit">
            connect
          </Button>
          <Button
            className="btn-semi-round"
            color="danger"
            type="button"
            onClick={handleReset}
          >
            reset
          </Button>
        </Col>
      </FormGroup>
    </Form>
  );

  const BookInfo = ({ disabled = false }) => (
    <Form id={disabled ? "disabled-save-book" : "save-book"}>
      <FormGroup className="w-100">
        <Input
          className="mb-1"
          type="text"
          id={disabled ? "disabled-book-id" : "book-id"}
          readOnly
          defaultValue={
            disabled ? "book id" : sess.getItem("bookId") || "book id"
          }
        />
        <Input
          className="my-1"
          type="text"
          id={disabled ? "disabled-book-name" : "book-name"}
          readOnly
          defaultValue={
            disabled ? "book name" : sess.getItem("bookName") || "book name"
          }
        />
        <Input
          className="mt-1"
          type="text"
          id={disabled ? "disabled-user-id" : "user-id"}
          readOnly
          defaultValue={
            disabled ? "user name" : sess.getItem("userId") || "user name"
          }
        />
        <Button
          className="btn-semi-round"
          color="primary"
          type="button"
          disabled={disabled || hasNoBookUserId()}
          onClick={handleSave}
        >
          save
        </Button>
      </FormGroup>
    </Form>
  );

  const IntermediateComponent = ({ linkLoading }) => (
    <div className="w-100 position-relative">
      <div className="w-100 h-100 bg-img">
        <img
          src="https://static.tildacdn.com/tild3633-3338-4961-b237-633361646262/Footer_Bg.svg"
          alt="background"
        />
      </div>
      {hasNoBookUserId() ? (
        linkLoading ? (
          <LoadingButton />
        ) : (
          <NoTargetUrlSet />
        )
      ) : (
        <BookCopied />
      )}
    </div>
  );

  const MemoizedIframe = memo(({ authedIn, targetUrlSet, linkLoading }) =>
    authedIn ? (
      targetUrlSet ? (
        linkLoading ? (
          <div className="iframe-loading w-100 h-100 d-flex flex-column justify-content-center align-items-center">
            <img
              src={spirow}
              alt="ProgressMe Logo"
              className="mb-3"
              style={{ width: "50px" }}
            />
            <Spinner size="sm" className="mb-2" />
            <span>Page is loading...</span>
          </div>
        ) : (
          <div className="w-100 position-relative">
            {!authedIn ? (
              <div
                className="no-auth-view-book"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  className="btn-semi-round"
                  color="primary"
                  type="button"
                  disabled={false}
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </Button>
              </div>
            ) : (
              <></>
            )}
            <iframe
              id="iframe_iframe"
              src={targetUrl}
              frameBorder="0"
              allowFullScreen={true}
              style={{
                minWidth: "100%",
                minHeight: "100%",
              }}
              className="iframe_iframe w-100 h-100 min-h-[500px]"
              title="course preview"
            />
          </div>
        )
      ) : (
        <IntermediateComponent linkLoading={linkLoading} />
      )
    ) : showLogin ? (
      <AuthIn />
    ) : (
      <IntermediateComponent linkLoading={linkLoading} />
    ),
  );

  const LeftComponent = ({ authedIn, targetUrlSet }) => {
    const [linkLoading, setLinkLoading] = useState(false);
    return (
      <Col>
        <Row lg="10">
          <LoadLink setLinkLoading={setLinkLoading} />
        </Row>
        <Row lg="10" className="h-100">
          <div
            className="iframe_wrapper w-100 h-100"
            style={{ minheight: "500px" }}
          >
            <MemoizedIframe
              authedIn={authedIn}
              targetUrlSet={targetUrlSet}
              linkLoading={linkLoading}
            />
          </div>
        </Row>
      </Col>
    );
  };

  return (
    <Col lg="12" className="h-100">
      <Card className="h-100">
        <CardHeader>
          <CardTitle tag="h5">Add the progressme link</CardTitle>
        </CardHeader>
        <CardBody className="p-4 h-100">
          <Row className="h-100 w-100 overflow-hidden">
            <LeftComponent authedIn={isAuthed} targetUrlSet={!!targetUrl} />
            <Col sm="3">
              <BookInfo disabled={!isAuthed} />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default memo(CourseScraper);
