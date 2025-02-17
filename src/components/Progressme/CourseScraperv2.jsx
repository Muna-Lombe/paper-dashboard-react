import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Spinner,
  Form,
  Input,
  Label,
} from "reactstrap";
import axios from "axios";
import { addError } from "../../variables/slices/errorSlice";
import { useDispatch } from "react-redux";
import spirow from "../../assets/img/spriral-arrow.png";
import { endpoints } from "config";

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
      const response = await axios.post(endpoints.paperDashApi.validateUrl.url, {
        url: url.trim(),
      });

      if (response.data.url) {
        const bookResponse = await axios.get(
          `${endpoints.paperDashApi.getBook.url}?url=${btoa(response.data.url)}`
        );
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
        const tokenResponse = await axios.get(endpoints.paperDashApi.getToken.url);
        sess.setItem("Auth-Token", tokenResponse.data.token);
      }

      const response = await axios.post(endpoints.paperDashApi.authenticate.url, {
        email: formData.get("email"),
        password: formData.get("password"),
      });

      sess.setItem("userId", response.data.data.Value.Id);
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

  const handleSave = () => {
    // Just console.log for now as per requirements
    console.log("Saving book details:", bookDetails);
  };

  const AuthForm = () => (
    <div className="auth-form p-4">
      <h3>Temporary Login</h3>
      <p className="text-muted mb-4">
        This login is temporary and only used to access your account.
        Your credentials are not stored.
      </p>
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

  const BookDetails = () => (
    <div className="book-details p-3">
      <Input
        value={bookDetails.bookId}
        readOnly
        placeholder="Book ID"
        className="mb-2"
      />
      <Input
        value={bookDetails.bookName}
        readOnly
        placeholder="Book Name"
        className="mb-2"
      />
      <Input
        value={bookDetails.userId}
        readOnly
        placeholder="User ID"
        className="d-none d-md-block mb-2"
      />
      <Button
        color="primary"
        onClick={handleSave}
        disabled={!bookDetails.bookId || !bookDetails.userId}
      >
        Save
      </Button>
    </div>
  );

  return (
    <Card className="h-100">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle tag="h4">Course Scraper</CardTitle>
        <div className="d-flex gap-2">
          <Input
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ width: "300px" }}
          />
          <Button color="primary" onClick={handleLoadLink} disabled={isLoading}>
            Connect
          </Button>
          <Button color="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <BookDetails />
        <div className="content-area mt-3 position-relative" style={{ minHeight: "400px" }}>
          {!isAuthenticated ? (
            <AuthForm />
          ) : !url ? (
            <div className="text-center">
              <img src={spirow} alt="arrow" style={{ width: "50px" }} />
              <p>Add your link above</p>
            </div>
          ) : (
            <div className="iframe-container">
              {isLoading ? (
                <div className="text-center">
                  <Spinner />
                  <p>Loading content...</p>
                </div>
              ) : (
                <iframe
                  src={url}
                  title="Course Content"
                  className="w-100 h-100"
                  style={{ minHeight: "500px" }}
                />
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default CourseScraperV2;