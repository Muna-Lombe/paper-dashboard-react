import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner
} from 'reactstrap';
import { supabase } from '../lib/supabase';
import '../assets/css/auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName
            }
          }
        });

        if (error) throw error;

        setSuccess('Registration successful! You can now log in.');
        setIsLogin(true);
        setFormData({ email: '', password: '', fullName: '' });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramAuth = () => {
    setError('Telegram authentication coming soon!');
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>

      <Container className="auth-container">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col lg="5" md="7" sm="10">
            <Card className="auth-card shadow-lg border-0">
              <CardBody className="p-5">
                <div className="text-center mb-4">
                  <h1 className="auth-title mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="auth-subtitle text-muted">
                    {isLogin
                      ? 'Sign in to continue to your dashboard'
                      : 'Sign up to get started with MoorHouse'}
                  </p>
                </div>

                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <FormGroup>
                      <Label for="fullName" className="form-label">Full Name</Label>
                      <Input
                        type="text"
                        name="fullName"
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required={!isLogin}
                        className="form-control-modern"
                      />
                    </FormGroup>
                  )}

                  <FormGroup>
                    <Label for="email" className="form-label">Email Address</Label>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-control-modern"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="password" className="form-label">Password</Label>
                    <Input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="form-control-modern"
                    />
                  </FormGroup>

                  <Button
                    color="primary"
                    block
                    size="lg"
                    type="submit"
                    disabled={loading}
                    className="auth-button mb-3"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      isLogin ? 'Sign In' : 'Sign Up'
                    )}
                  </Button>
                </Form>

                <div className="divider my-4">
                  <span>OR</span>
                </div>

                <Button
                  color="info"
                  outline
                  block
                  size="lg"
                  onClick={handleTelegramAuth}
                  className="telegram-button"
                >
                  <i className="fab fa-telegram me-2"></i>
                  Continue with Telegram
                </Button>

                <div className="text-center mt-4">
                  <p className="mb-0">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <Button
                      color="link"
                      className="p-0 auth-link"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setSuccess('');
                        setFormData({ email: '', password: '', fullName: '' });
                      }}
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Button>
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auth;
