import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validate = (): boolean => {
    setEmailError(null);
    setErrorMsg(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError('Email address is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMsg(error.message || 'Unable to process reset request. Please try again.');
        setSubmitting(false);
      } else {
        setSubmitted(true);
        setSubmitting(false);
      }
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        heading="Check Your Inbox"
        subheading="Password recovery instructions sent."
      >
        <div className="auth-verification-card">
          <div className="verification-icon-box">
            <Mail size={32} className="text-sky" />
          </div>
          <h3 className="verification-title">Reset Link Sent</h3>
          <p className="verification-desc">
            If an account is associated with <strong>{email}</strong>, you will receive a secure password reset link shortly. Please check your inbox and spam folder.
          </p>
          <div className="verification-actions">
            <Link to="/login" className="auth-submit-btn">
              <span>Back to Login</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Forgot Your Password?"
      subheading="Enter your registered email address and we'll send you a password reset link."
      motivationalHeading="Account Recovery Made Simple."
      motivationalText="Safely recover your account, restore your personal notes, and keep your algorithm progress intact."
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
          <label htmlFor="forgot-email" className="auth-label">
            Email address
          </label>
          <div className="auth-input-wrapper">
            <input
              id="forgot-email"
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

        {/* Submit Button */}
        <button
          type="submit"
          className="auth-submit-btn"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="auth-spinner"></div>
              <span>Sending reset link...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Back to Login Link */}
        <div className="auth-switch-prompt">
          <Link to="/login" className="back-to-login-link">
            <ArrowLeft size={15} />
            <span>Return to Login</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
