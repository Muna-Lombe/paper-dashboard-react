import React, { memo, useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardTitle, Row, Col, Button, Spinner, FormGroup, Form, Input, Label } from "reactstrap";
import { ArrowUpCircle, Loader2, RefreshCw } from 'lucide-react';
import axios from "axios";
import { addError } from "../../variables/slices/errorSlice";
import { useDispatch } from "react-redux";
import { endpoints } from "config";
import { addToast } from "variables/slices/toastSlice";
import { cn } from "../../utils/cn";

const CourseScraperV2 = () => {
  const [targetUrl, setTargetUrl] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const sess = sessionStorage;
  const dispatch = useDispatch();

  const handleGetBook = async (e, tUrl) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `${endpoints.paperDashApi.getBook.url}?url=${btoa(targetUrl ?? tUrl) || ""}`
      );
      if (response?.data) {
        sess.setItem("bookId", response.data?.bookId || "nil");
        sess.setItem("bookName", response.data?.bookName || "nil");
      } else {
        dispatch(addError("Book not loaded correctly. Please try again."));
        sess.setItem("bookId", "");
        sess.setItem("bookName", "");
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to get book"));
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
        }
      );

      if (response.data.url) {
        await handleGetBook(e, response.data.url);
        setTargetUrl(response.data.url);
        setShowLogin(false);
      } else {
        dispatch(addError("Book link is not correct. Please check."));
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to validate URL"));
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
      dispatch(addToast("Book saved, go to your dashboard to see it"));
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Failed to copy course"));
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      if (!sess.getItem("Auth-Token")) {
        const tokenResponse = await axios.get(
          endpoints.paperDashApi.getToken.url
        );
        sess.setItem("Auth-Token", tokenResponse.data.token);
      }

      const response = await axios.post(
        endpoints.paperDashApi.authenticate.url,
        {
          email,
          password,
        }
      );

      sess.setItem("userId", response.data.data.Value.Id);
      setIsAuthed(true);
      setShowLogin(false);
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Authentication failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    sess.removeItem("bookId");
    sess.removeItem("bookName");
    setTargetUrl(null);
    setShowLogin(true);
    setIsAuthed(false);
  };

  const BookDetails = ({ disabled = false }) => {
    const hasNoBookUserId = !sess.getItem("bookId")?.length || !sess.getItem("userId")?.length;

    return (
      <div className="book-details p-4 bg-white rounded-lg shadow-sm">
        <Form className="space-y-4">
          <FormGroup>
            <Input
              className="mb-2"
              type="text"
              readOnly
              value={disabled ? "book id" : sess.getItem("bookId") || "book id"}
            />
            <Input
              className="mb-2"
              type="text"
              readOnly
              value={disabled ? "book name" : sess.getItem("bookName") || "book name"}
            />
            <Input
              type="text"
              readOnly
              value={disabled ? "user id" : sess.getItem("userId") || "user id"}
              className="hidden md:block mb-2"
            />
            <Button
              color="primary"
              disabled={disabled || hasNoBookUserId}
              onClick={handleSave}
              className="w-full mt-2"
            >
              Save Book
            </Button>
          </FormGroup>
        </Form>
      </div>
    );
  };

  const AuthForm = () => (
    <div className="auth-form-container w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Temporary Login</h3>
      <p className="text-sm text-gray-600 mb-6">
        Enter your credentials to access your account.
        <br />
        <em className="text-xs">
          This is necessary to save the book to your account. We do not store your credentials.
        </em>
      </p>
      <Form onSubmit={handleAuth} className="space-y-4">
        <FormGroup>
          <Label className="text-sm font-medium">Email</Label>
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            disabled={isLoading}
            required
            className="mt-1"
          />
        </FormGroup>
        <FormGroup>
          <Label className="text-sm font-medium">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Enter your password"
            disabled={isLoading}
            required
            className="mt-1"
          />
        </FormGroup>
        <Button
          type="submit"
          color="primary"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </Form>
    </div>
  );

  const ContentArea = () => {
    if (!isAuthed && showLogin) {
      return <AuthForm />;
    }

    if (linkLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading content...</p>
        </div>
      );
    }

    if (!targetUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <ArrowUpCircle className="h-16 w-16 text-primary mb-4" />
          <p className="text-lg">Add your link above to get started</p>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full min-h-[500px]">
        {!isAuthed && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <Button
              color="primary"
              onClick={() => setShowLogin(true)}
              className="text-lg"
            >
              Login to View Content
            </Button>
          </div>
        )}
        <iframe
          src={targetUrl}
          className={cn(
            "w-full h-full border-0",
            !isAuthed && "pointer-events-none"
          )}
          title="Course Preview"
        />
      </div>
    );
  };

  return (
    <Card className="course-scraper-card">
      <CardHeader>
        <CardTitle tag="h5">Course Scraper</CardTitle>
        <Form
          onSubmit={(e) => handleLoadLink(e, setLinkLoading)}
          className="flex gap-2 mt-4"
        >
          <Input
            type="url"
            placeholder="Enter course URL"
            disabled={linkLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            color="primary"
            disabled={linkLoading}
          >
            {linkLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Connect'
            )}
          </Button>
          <Button
            type="button"
            color="secondary"
            onClick={handleReset}
            disabled={linkLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Form>
      </CardHeader>
      <CardBody className="p-4">
        <Row>
          <Col md="9">
            <ContentArea />
          </Col>
          <Col md="3">
            <BookDetails disabled={!isAuthed} />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default memo(CourseScraperV2);