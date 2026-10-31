import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    setPasswordError(null);
    setConfirmError(null);
    setErrorMsg(null);

    if (!password) {
      setPasswordError('New password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your new password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
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
      const { error } = await updateUserPassword(password);
      if (error) {
        setErrorMsg(error.message || 'Failed to update password. Your recovery link may have expired.');
        setSubmitting(false);
      } else {
        setSuccess(true);
        setSubmitting(false);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2500);
      }
    } catch {
      setErrorMsg('An unexpected network error occurred.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        heading="Password Updated!"
        subheading="Your account has been secured."
      >
        <div className="auth-verification-card">
          <div className="verification-icon-box success">
            <CheckCircle2 size={36} className="text-success" />
          </div>
          <h3 className="verification-title">Password Successfully Reset</h3>
          <p className="verification-desc">
            Your new password has been saved. Redirecting you to login...
          </p>
          <div className="verification-actions">
            <Link to="/login" className="auth-submit-btn">
              <span>Go to Login Now</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Set New Password"
      subheading="Enter your new password to regain access to your AlgoTrack account."
      motivationalHeading="Secure & Seamless Access."
      motivationalText="Choose a strong password to safeguard your interview solutions and practice history."
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertCircle size={17} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* New Password */}
        <div className="auth-form-group">
          <label htmlFor="reset-new-password" className="auth-label">
            New password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              placeholder="At least 6 characters"
              className={`auth-input ${passwordError ? 'has-error' : ''}`}
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
          {passwordError && <span className="field-error-text">{passwordError}</span>}
        </div>

        {/* Confirm Password */}
        <div className="auth-form-group">
          <label htmlFor="reset-confirm-password" className="auth-label">
            Confirm new password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError(null);
              }}
              placeholder="Re-enter new password"
              className={`auth-input ${confirmError ? 'has-error' : ''}`}
              disabled={submitting}
              required
            />
            <button
              type="button"
              className="auth-input-icon-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmError && <span className="field-error-text">{confirmError}</span>}
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
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Return to Login */}
        <div className="auth-switch-prompt">
          <Link to="/login" className="auth-switch-link">
            Cancel and Return to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
