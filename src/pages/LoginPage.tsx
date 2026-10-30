import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Determine redirect target after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const validate = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setErrorMsg(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Incorrect email or password. Please try again.');
        } else {
          setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
        }
        setSubmitting(false);
      } else {
        // Success
        navigate(from, { replace: true });
      }
    } catch {
      setErrorMsg('An unexpected network error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heading="Welcome Back!"
      subheading="Continue your coding journey with AlgoTrack."
      motivationalHeading="Keep Your Daily Coding Habit Alive."
      motivationalText="Revisit your saved approaches, analyze time complexity, and track solved challenges without losing momentum."
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertCircle size={17} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="auth-form-group">
          <label htmlFor="login-email" className="auth-label">
            Email address
          </label>
          <div className="auth-input-wrapper">
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              placeholder="name@example.com"
              className={`auth-input ${emailError ? 'has-error' : ''}`}
              disabled={submitting}
              required
            />
          </div>
          {emailError && <span className="field-error-text">{emailError}</span>}
        </div>

        {/* Password Field */}
        <div className="auth-form-group">
          <label htmlFor="login-password" className="auth-label">
            Password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="auth-input"
              disabled={submitting}
              required
            />
            <button
              type="button"
              className="auth-input-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="auth-row-options">
          <label className="auth-remember-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={submitting}
            />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="auth-forgot-link">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="auth-submit-btn"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="auth-spinner"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Login</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Switch Link */}
        <div className="auth-switch-prompt">
          <span>Don't have an account?</span>
          <Link to="/register" className="auth-switch-link">
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
