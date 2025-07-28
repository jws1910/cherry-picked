import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setConfirmPasswordError('');
    setFieldErrors({});
    
    try {
      if (isSignUp) {
        // Validate all required fields for signup
        const newFieldErrors = {};
        
        if (!firstName.trim()) newFieldErrors.firstName = 'This is a required field';
        if (!lastName.trim()) newFieldErrors.lastName = 'This is a required field';
        if (!email.trim()) newFieldErrors.email = 'This is a required field';
        if (!password.trim()) newFieldErrors.password = 'This is a required field';
        if (!confirmPassword.trim()) newFieldErrors.confirmPassword = 'This is a required field';
        
        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }

        // Validate password strength
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please try again.');
          setLoading(false);
          return;
        }

        // Register new user
        const response = await axios.post('http://localhost:3001/api/auth/register', {
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const user = response.data.user;
          localStorage.setItem('cherryUser', JSON.stringify(user));
          localStorage.setItem('authToken', response.data.token);
          onLogin(user);
        }
      } else {
        // Validate required fields for login
        const newFieldErrors = {};
        
        if (!email.trim()) newFieldErrors.email = 'This is a required field';
        if (!password.trim()) newFieldErrors.password = 'This is a required field';
        
        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }

        // Login existing user
        const response = await axios.post('http://localhost:3001/api/auth/login', {
          email: email.trim(),
          password
        }, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const user = response.data.user;
          localStorage.setItem('cherryUser', JSON.stringify(user));
          localStorage.setItem('authToken', response.data.token);
          onLogin(user);
        }
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection and try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check if the server is running and try again.');
      } else if (error.response) {
        const { message } = error.response.data;
        
        if (message === 'Invalid credentials' && !isSignUp) {
          // Check if user doesn't exist
          try {
            await axios.post('http://localhost:3001/api/auth/check-email', { email: email.trim() });
            // If we get here, user exists but password is wrong
            setError('Invalid password. Please try again.');
          } catch (emailError) {
            if (emailError.response?.data?.message === 'User not found') {
              setShowSignupPrompt(true);
              setError('');
            } else {
              setError('Invalid credentials. Please try again.');
            }
          }
        } else if (message === 'An account already exists with this email' && isSignUp) {
          setError('An account with this email already exists. Please log in instead.');
        } else {
          setError(message || 'An error occurred. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFieldBlur = (fieldName) => {
    const newFieldErrors = { ...fieldErrors };
    
    if (fieldName === 'firstName' && !firstName.trim()) {
      newFieldErrors.firstName = 'This is a required field';
    } else if (fieldName === 'lastName' && !lastName.trim()) {
      newFieldErrors.lastName = 'This is a required field';
    } else if (fieldName === 'email' && !email.trim()) {
      newFieldErrors.email = 'This is a required field';
    } else if (fieldName === 'password' && !password.trim()) {
      newFieldErrors.password = 'This is a required field';
    } else if (fieldName === 'confirmPassword' && !confirmPassword.trim()) {
      newFieldErrors.confirmPassword = 'This is a required field';
    } else {
      // Clear error if field is now filled
      delete newFieldErrors[fieldName];
    }
    
    setFieldErrors(newFieldErrors);
  };

  const handleFieldChange = (fieldName, value) => {
    const newFieldErrors = { ...fieldErrors };
    
    // Clear error if field is now filled
    if (value.trim()) {
      delete newFieldErrors[fieldName];
    }
    
    setFieldErrors(newFieldErrors);
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Password doesn\'t match with above');
    } else {
      setConfirmPasswordError('');
    }
    
    // Also check if field is empty
    if (!confirmPassword.trim()) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'This is a required field' }));
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    // Clear error if passwords now match
    if (e.target.value && password === e.target.value) {
      setConfirmPasswordError('');
    }
    
    // Clear field error if field is now filled
    if (e.target.value.trim()) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const handleSignupPrompt = (createAccount) => {
    if (createAccount) {
      setIsSignUp(true);
      setShowSignupPrompt(false);
      setError('');
    } else {
      setShowSignupPrompt(false);
      setError('');
    }
  };

  const handleToggleAuth = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setShowSignupPrompt(false);
    setConfirmPasswordError('');
    setFieldErrors({});
    setPassword('');
    setConfirmPassword('');
    // Clear form when switching modes
    if (!isSignUp) {
      setFirstName('');
      setLastName('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo.png" alt="cherry-picker" className="app-logo" />
        </div>
        
        <h1>cherry-picked</h1>
        <p className="slogan">Your personal fashion sale tracker</p>
        
        {showSignupPrompt ? (
          <div className="signup-prompt">
            <p>No account found with this email address.</p>
            <p>Would you like to create a new account?</p>
            <div className="prompt-buttons">
              <button 
                className="prompt-btn yes-btn"
                onClick={() => handleSignupPrompt(true)}
              >
                Yes, Sign Up
              </button>
              <button 
                className="prompt-btn no-btn"
                onClick={() => handleSignupPrompt(false)}
              >
                No, Try Again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      handleFieldChange('firstName', e.target.value);
                    }}
                    onBlur={() => handleFieldBlur('firstName')}
                    required
                    className="form-input"
                  />
                  {fieldErrors.firstName && <p className="field-error">{fieldErrors.firstName}</p>}
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      handleFieldChange('lastName', e.target.value);
                    }}
                    onBlur={() => handleFieldBlur('lastName')}
                    required
                    className="form-input"
                  />
                  {fieldErrors.lastName && <p className="field-error">{fieldErrors.lastName}</p>}
                </div>
              </>
            )}
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleFieldChange('email', e.target.value);
                }}
                onBlur={() => handleFieldBlur('email')}
                required
                className="form-input"
              />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>
            
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleFieldChange('password', e.target.value);
                }}
                onBlur={() => handleFieldBlur('password')}
                required
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
                             {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>

            {isSignUp && (
              <div className="form-group password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password *"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
                                 {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {confirmPasswordError && (
              <div className="confirm-password-error">
                {confirmPasswordError}
              </div>
            )}
        
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
            </button>
          </form>
        )}
        
        {!showSignupPrompt && (
          <div className="login-footer">
            <button 
              className="toggle-auth"
              onClick={handleToggleAuth}
            >
              {isSignUp ? 'Already have an account? Log In' : 'New user? Sign Up'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 