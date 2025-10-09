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
import { endpoints } from "@/config";
import { addToast } from "variables/slices/toastSlice";
import { useNavigate } from "react-router-dom";
import useAuth from "variables/hooks/useAuth";

const CourseScraperV2 = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookDetails, setBookDetails] = useState({
    bookId: "",
    bookName: "",
    userId: "",
  });
  const sess = sessionStorage;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth(); // Get isAuthenticated and userId from useAuth hook

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // on page load, check if there is a bookId in session storage and remove it
  useEffect(() => {});

  const handleLoadLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        endpoints.paperDashApi.validateUrl.url,
        {
          url: e.target?.[0]?.value.trim() || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": "Bearer " + sess.getItem("Auth-Token"),
          },
        }
      );

      if (response.data.url) {
        const bookResponse = await axios.get(
          `${endpoints.paperDashApi.getBook.url}?url=${btoa(response.data.url)}`,
        );
        setUrl(response.data.url);
        setBookDetails({
          bookId: bookResponse.data?.bookId || "",
          bookName: bookResponse.data?.bookName || "",
          userId: userId || "", // Use userId from useAuth
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

  const handleReset = () => {
    setUrl("");
    setBookDetails({ bookId: "", bookName: ""});
  };

  const handleResetId = () => {
    sess.removeItem("userId");
    // setIsAuthenticated(false); // No longer managing local auth state
    setBookDetails(ps=>({...ps, userId:""}));
  };

  const handleSave = async (e) => {
    console.log("Saving book details:", bookDetails);
    e.preventDefault();
    const { bookId, userId } = bookDetails;
    const token = sess.getItem("Auth-Token");

    if (!bookId || !userId || !token) {
      dispatch(addError("Missing required information"));
      return;
    }

    try {
      await axios.post(
        endpoints.paperDashApi.copyCourse.url,
        {
          bookId,
          userId,
          token,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": "Bearer "+ sess.getItem("Auth-Token"),
          },
        }
      );
      dispatch(addToast("Book saved, go to your dashboard to see it"));
      setTimeout(() => {
        setUrl("https://progressme.ru/TeacherAccount/materials/personal");
      }, 10000);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to copy course"));
    }
  };

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


  const BookDetails = () => {
    const Details = () => (
      <div className="d-flex flex-column justify-content-between align-items-baseline gap-4">
        <Input
          value={bookDetails.bookId}
          readOnly
          placeholder="Book ID"
          className="m-2"
          style={{
            maxWidth: "200px",
          }}
        />
        <Input
          value={bookDetails.bookName}
          readOnly
          placeholder="Book Name"
          className="m-2"
          style={{
            maxWidth: "200px",
          }}
        />
        <div className="position-relative w-auto">
          <Input
            color={"danger"}
            value={bookDetails.userId || userId}
            readOnly
            placeholder="User ID"
            className={
              (isAuthenticated
                ? "border border-success"
                : " border border-danger ") + " m-2 "
            }
            style={{
              maxWidth: "200px",
            }}
          />
          <span
            color={isAuthenticated ? "success" : "danger"}
            className={isAuthenticated
            ?("position-absolute top-50 right-0") : "d-none "+ " w-25 h-50 border border-danger text-sm-center"}
            style={{top: "25%", right: "8%", zIndex: 1, cursor: "pointer" }}
            onClick={handleResetId}
          >
            <i className="fas fa-times text-danger" style={{fontSize: "1.5rem", marginTop: "4px"}}></i>
          </span>
        </div>
      </div>
    );
    return(
      <>
        <Col md="6" className="book-details  p-3 d-xs-none d-sm-none d-md-none d-lg-flex flex-column justify-content-between align-items-baseline gap-4 " style={{width: "100%", maxWidth: "150px"}}>
          <div className="w-100 d-flex flex-column justify-content-evenly ">
            <Details/>
          </div>
          <Button
            color="primary"
            onClick={handleSave}
            style={{ width: "100%", maxWidth: "80px" }}
            disabled={!isAuthenticated || !bookDetails.bookId || !bookDetails.userId}
          >
            Save
          </Button>
        </Col>
        <Row md="2" className="book-details p-3 w-100 d-lg-none d-xl-none d-2xl-none d-md-flex flex-wrap justify-content-end align-items-baseline gap-4" style={{width: "100%"}}>
          <div className="w-100 d-flex justify-content-end ">
            <Details/>
          </div>
          <Button
            color="primary"
            onClick={handleSave}
            style={{width: "100%", maxWidth: "200px"}}
            disabled={!isAuthenticated || !bookDetails.bookId || !bookDetails.userId}
          >
            Save
          </Button>
        </Row>
      </>
    );
  };

  const BookContent = () => {
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
            className="w-100 h-100"
            style={{ border: "none", minHeight: "500px",  }}
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
            {/* <AuthForm /> */}
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

    // No link and not authenticated (initial state) - should redirect
    return (
      <div className="d-flex flex-column align-items-center p-4">
        <p className="text-center mb-4">
          Please log in to access course content.
        </p>
        {/* <AuthForm /> */}
      </div>
    );
  };

  return (
    <Card className="h-100 course-scraper-card">
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
              <Col className="d-flex justify-content-end mt-2">
                <Button color="primary" type="submit" disabled={isLoading} className="mr-2">
                  <i className="fas fa-link mr-1 d-md-none"></i>
                  <span className="d-none d-md-inline">Connect</span>
                </Button>
                <Button color="secondary" onClick={handleReset}>
                  <i className="fas fa-undo mr-1 d-md-none"></i>
                  <span className="d-none d-md-inline">Reset</span>
                </Button>
              </Col>
            </FormGroup>
          </Form>
        </div>
      </CardHeader>
      <CardBody className="d-flex flex-column flex-md-row course-scraper-body">
        <div className="content-area  p-3 order-md-1 order-2" style={{ width: "100%" }}>
          {BookContent()}
        </div>
        <div className="details-sidebar p-3 order-md-2 order-1 bg-light border-left" style={{width: "auto"}}>
          <BookDetails />
        </div>
      </CardBody>
    </Card>
  );
};

export default CourseScraperV2;
