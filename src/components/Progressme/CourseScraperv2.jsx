import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Spinner,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Col,
} from "reactstrap";
import axios from "axios";
import { addError } from "../../variables/slices/errorSlice";
import { useDispatch } from "react-redux";
import spirow from "../../assets/img/spriral-arrow.png";
import { endpoints } from "config";
import { addToast } from "variables/slices/toastSlice";

const CourseScraperV2 = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookDetails, setBookDetails] = useState({
    bookId: "",
    bookName: "",
    userId: "",
  });
  const sess = sessionStorage;
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sess.getItem("Auth-Token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoadLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        endpoints.paperDashApi.validateUrl.url,
        {
          url: e.target?.[0]?.value.trim() || "",
        },
      );

      if (response.data.url) {
        const bookResponse = await axios.get(
          `${endpoints.paperDashApi.getBook.url}?url=${btoa(response.data.url)}`,
        );
        setUrl(response.data.url);
        setBookDetails({
          bookId: bookResponse.data?.bookId || "",
          bookName: bookResponse.data?.bookName || "",
          userId: sess.getItem("userId") || "",
        });
      } else {
        dispatch(addError("Invalid URL"));
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to load URL"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    try {
      if (!sess.getItem("Auth-Token")) {
        const tokenResponse = await axios.get(
          endpoints.paperDashApi.getToken.url,
        );
        sess.setItem("Auth-Token", tokenResponse.data.token);
      }

      const response = await axios.post(
        endpoints.paperDashApi.authenticate.url,
        {
          email: formData.get("email"),
          password: formData.get("password"),
        },
      );

      sess.setItem("userId", response.data.data.Value.Id);
      setBookDetails((ps) => ({ ...ps, userId: response.data.data.Value.Id }));
      setIsAuthenticated(true);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Authentication failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setBookDetails({ bookId: "", bookName: "", userId: "" });
  };

  const handleSave = async(e) => {
    console.log("Saving book details:", bookDetails);
    e.preventDefault();
    const {bookId,userId} = bookDetails;
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
      dispatch(addToast( "Book saved, go to your dashboard to see it"))
      setTimeout(() => {
        setUrl("https://progressme.ru/TeacherAccount/materials/personal");
      }, 10000);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to copy course"));
    }
  };

  const AuthForm = () => (
    <div className="auth-form p-2">
      <Form onSubmit={handleAuth}>
        <div className="mb-3">
          <Label>Email</Label>
          <Input type="email" name="email" required />
        </div>
        <div className="mb-3">
          <Label>Password</Label>
          <Input type="password" name="password" required />
        </div>
        <Button color="primary" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : "Login"}
        </Button>
      </Form>
    </div>
  );

  const LoadingComponent = () => (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "400px" }}
    >
      <Spinner style={{ width: "3rem", height: "3rem" }} />
      <p className="mt-3 text-primary">Loading your content...</p>
      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
    </div>
  );

  const NoLinkComponent = () => (
    <div className="text-center p-4">
      <img src={spirow} alt="arrow" style={{ width: "50px" }} />
      <p className="mt-3">Add your link above</p>
    </div>
  );

  const AuthOverlay = () => (
    <div
      className="auth-overlay position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        top: 0,
        left: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 1000,
      }}
    >
      <AuthForm />
    </div>
  );

  const BookDetails = () => (
    <div className="book-details p-3 w-75 d-flex flex-wrap justify-content-between align-items-baseline gap-4">
      <div className="w-75 d-flex">
        <Input
          value={bookDetails.bookId}
          readOnly
          placeholder="Book ID"
          className="m-2"
        />
        <Input
          value={bookDetails.bookName}
          readOnly
          placeholder="Book Name"
          className="m-2"
        />
        <Input
          color={isAuthenticated ? "success" : "danger"}
          value={bookDetails.userId || sess.getItem("userId")}
          readOnly
          placeholder="User ID"
          className={
            (isAuthenticated
              ? "border border-success"
              : " border border-danger ") + " m-2 "
          }
        />
      </div>
      <Button
        color="primary"
        onClick={handleSave}
        disabled={
          !isAuthenticated || !bookDetails.bookId || !bookDetails.userId
        }
      >
        Save
      </Button>
    </div>
  );

  const renderContent = () => {
    // Link loaded but not authenticated
    useEffect(() => {
      const iframe = document.querySelector("iframe");
      const handleIframeLoad = () => {
        setIsLoading(false);
      };

      if (iframe) {
        iframe.addEventListener("load", handleIframeLoad);
      }

      return () => {
        if (iframe) {
          iframe.removeEventListener("load", handleIframeLoad);
        }
      };
    }, [url]);
    // Link loading state
    if (isLoading) {
      return (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "400px" }}
        >
          <Spinner style={{ width: "3rem", height: "3rem" }} className="mb-3" />
          <p className="text-primary">Loading your content...</p>
        </div>
      );
    }

    // Link loaded and authenticated
    if (url && isAuthenticated) {
      return (
        <div className="iframe-container">
          <iframe
            src={url}
            title="Course Content"
            className="w-75 h-100"
            style={{ border: "none", minHeight: "500px" }}
          />
        </div>
      );
    }

    if (url && !isAuthenticated) {
      return (
        <div
          className="iframe-container position-relative"
          style={{ minWidth: "35rem", aspectRatio: "2/1" }}
        >
          <div className="w-100 h-100">
            <iframe src={url} title="Course Content" className="w-100 h-100" />
          </div>
          <div
            className=" w-100 h-100 position-absolute d-flex flex-column justify-content-center align-items-center"
            style={{ top: 0, left: 0, background: "rgba(0,0,0,0.7)" }}
          >
            <h4 className="text-white mb-1">
              Please authenticate to view the content
            </h4>
            <AuthForm />
          </div>
        </div>
      );
    }

    // No link but authenticated
    if (!url && isAuthenticated) {
      return (
        <div className="text-center p-4">
          <img
            src={spirow}
            alt="arrow"
            style={{ width: "80px", transform: "rotate(-90deg)" }}
            className="mb-3"
          />
          <p className="h5">Add your link above to get started</p>
        </div>
      );
    }

    // No link and not authenticated (initial state)
    return (
      <div className="d-flex flex-column align-items-center p-4">
        <p className="text-center mb-4">
          Welcome! To access and save course content, please log in first. Then
          you can add a course link above to view its contents.
        </p>
        <h3>Temporary Login</h3>

        <AuthForm />
      </div>
    );
  };

  return (
    <Card className="h-100">
      <CardHeader className="d-flex flex-column justify-content-between align-items-center">
        <CardTitle tag="h4">Course Scraper</CardTitle>
        <div className="w-75 d-flex justify-content-start align-items-baseline gap-3">
          <Form
            id="load-link"
            className="w-75"
            onSubmit={(e) => handleLoadLink(e)}
          >
            <FormGroup className="w-100">
              <Input
                type="text"
                placeholder="progressme link"
                defaultValue={url || ""}
                className="form-control"
              />
              <div className="invalid-feedback">
                Please check the link and make sure there are no spaces.
              </div>
              <Col className="d-flex justify-content-end">
                <Button color="primary" type="submit" disabled={isLoading}>
                  {/* link icon */}

                  <span className="d-none d-md-inline">Connect</span>
                  <span className="d-inline d-md-none">
                    <i className="fas fa-link"></i>
                  </span>
                </Button>
                <Button color="secondary" onClick={handleReset}>
                  Reset
                </Button>
              </Col>
            </FormGroup>
          </Form>
          {/* <Input
            placeholder="Enter URL"
            defaultValue={url}
            value={url}
            style={{ width: "300px" }}
          /> */}
          {/* <Button color="primary" onClick={handleLoadLink} disabled={isLoading}>
           
            
            <span className="d-none d-md-inline">Connect</span>
            <span className="d-inline d-md-none">
              <i className="fas fa-link"></i>
            </span>
          </Button>
          <Button color="secondary" onClick={handleReset}>
            Reset
          </Button> */}
        </div>
      </CardHeader>
      <CardBody className="d-flex flex-wrap justify-content-between align-items-center">
        <BookDetails />
        <div className="content-area mt-3 w-100">{renderContent()}</div>
      </CardBody>
    </Card>
  );
};

export default CourseScraperV2;
