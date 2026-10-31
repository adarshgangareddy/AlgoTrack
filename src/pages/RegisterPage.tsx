import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message || 'Failed to sign in with Google.');
        setSubmitting(false);
      }
    } catch {
      setErrorMsg('Google sign in failed. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmailAlreadyRegistered, setIsEmailAlreadyRegistered] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setErrorMsg(null);
    setIsEmailAlreadyRegistered(false);

    // Full name
    if (!fullName.trim()) {
      setNameError('Full name cannot be empty.');
      isValid = false;
    }

    // Username
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) {
      setUsernameError('Please choose a username.');
      isValid = false;
    } else if (cleanUser.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      setUsernameError('Only letters, numbers, and underscores allowed.');
      isValid = false;
    }

    // Email
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    // Password
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    // Confirm password
    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
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
      const { error, requiresEmailVerification } = await signUp(
        fullName.trim(),
        username.trim(),
        email.trim(),
        password,
        { target_role: targetRole }
      );

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes('already registered') || 
          msg.includes('already exists') || 
          msg.includes('user already registered')
        ) {
          setErrorMsg('An account with this email already exists.');
          setIsEmailAlreadyRegistered(true);
        } else {
          setErrorMsg(error.message || 'Registration failed. Please try again.');
        }
        setSubmitting(false);
      } else if (requiresEmailVerification) {
        setVerificationRequired(true);
        setSubmitting(false);
      } else {
        // Successful registration with active session
        navigate('/dashboard', { replace: true });
      }
    } catch {
      setErrorMsg('An unexpected network error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  // If email confirmation is required by Supabase project
  if (verificationRequired) {
    return (
      <AuthLayout
        heading="Verify Your Email"
        subheading="Check your inbox to complete registration."
      >
        <div className="auth-verification-card">
          <div className="verification-icon-box">
            <Mail size={32} className="text-sky" />
          </div>
          <h3 className="verification-title">Confirmation Link Sent!</h3>
          <p className="verification-desc">
            We sent a verification link to <strong>{email}</strong>. Please click the link inside to confirm your account and get started.
          </p>
          <div className="verification-actions">
            <Link to="/login" className="auth-submit-btn">
              <span>Return to Login</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const isLengthValid = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <AuthLayout
      heading="Start Your Coding Journey"
      subheading="Create your account and organize your coding practice."
      motivationalHeading="Practice Smarter, Never from Scratch."
      motivationalText="Track ~400 popular interview problems categorized by patterns like Sliding Window, Two Pointers, and Dynamic Programming."
    >
      {/* Google OAuth Button */}
      <button
        type="button"
        className="auth-google-btn"
        onClick={handleGoogleSignIn}
        disabled={submitting}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="auth-divider">
        <span>or sign up with email</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertCircle size={17} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="auth-form-group">
          <label htmlFor="reg-name" className="auth-label">
            Full name
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Ex. Adarsh Reddy"
              className={`auth-input ${nameError ? 'has-error' : ''}`}
              disabled={submitting}
              required
            />
          </div>
          {nameError && <span className="field-error-text">{nameError}</span>}
        </div>

        {/* Email */}
        <div className="auth-form-group">
          <label htmlFor="reg-email" className="auth-label">
            Email address
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reg-email"
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

        {/* Password */}
        <div className="auth-form-group">
          <label htmlFor="reg-password" className="auth-label">
            Password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reg-password"
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

          {/* Password Requirements Guide (only active when typing) */}
          {password.length > 0 && (
            <div className="password-hints">
              <div className={`hint-item ${isLengthValid ? 'met' : ''}`}>
                <CheckCircle2 size={12} />
                <span>6+ characters</span>
              </div>
              <div className={`hint-item ${hasLetter ? 'met' : ''}`}>
                <CheckCircle2 size={12} />
                <span>Contains letters</span>
              </div>
              <div className={`hint-item ${hasNumber ? 'met' : ''}`}>
                <CheckCircle2 size={12} />
                <span>Contains numbers</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="auth-form-group">
          <label htmlFor="reg-confirm-password" className="auth-label">
            Confirm password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError(null);
              }}
              placeholder="Re-enter password"
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
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Switch Link */}
        <div className="auth-switch-prompt">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-switch-link">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
