import React, { useState } from "react";
import { Button, Form, FormGroup, Input, Label, Spinner } from "reactstrap";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addError } from "../../variables/slices/errorSlice";
import { endpoints } from "../../config"; // Adjust path as needed

const LoginPage = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const sess = sessionStorage;

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    try {
      // Existing token logic from CourseScraperv2.jsx
      if (!sess.getItem("Auth-Token")) {
        const tokenResponse = await axios.get(
          endpoints.paperDashApi.getToken.url,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "Authorization": "Bearer " + sess.getItem("expirableToken"),
            },
          },
        );
        sess.setItem("Auth-Token", tokenResponse.data.token);
      }

      const response = await axios.post(
        endpoints.paperDashApi.authenticate.url,
        {
          email: formData.get("email"),
          password: formData.get("password"),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": "Bearer " + sess.getItem("Auth-Token"),
          },
        },
      );
      if (response.data.token) {
        sess.setItem("Auth-Token", response.data.token);
      }
      sess.setItem("userId", response.data.data.Value.Id);
      onLoginSuccess(true); // Notify parent component of successful login
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Authentication failed"));
      onLoginSuccess(false); // Notify parent of failed login
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form p-2">
      <h3>Login with Email</h3>
      <Form onSubmit={handleAuth}>
        <FormGroup className="mb-3">
          <Label>Email</Label>
          <Input type="email" name="email" required />
        </FormGroup>
        <FormGroup className="mb-3">
          <Label>Password</Label>
          <Input type="password" name="password" required />
        </FormGroup>
        <Button color="primary" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : "Login"}
        </Button>
      </Form>
    </div>
  );
};

export default LoginPage;
