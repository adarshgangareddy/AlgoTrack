import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let subscription: { unsubscribe: () => void } | undefined;

    const handleAuthCallback = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        // 1. Surface any OAuth error returned in query or hash
        const oauthError =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('error') ||
          hashParams.get('error');

        if (oauthError) {
          if (isMounted) setErrorMsg(decodeURIComponent(oauthError.replace(/\+/g, ' ')));
          return;
        }

        // 2. Handle PKCE authorization code flow (?code=...)
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!isMounted) return;
          if (error) {
            setErrorMsg(error.message);
            return;
          }
          if (data.session) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }

        // 3. Check if session is already established (implicit flow or completed exchange)
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          navigate('/dashboard', { replace: true });
          return;
        }

        // 4. Listen for async auth state completion before timing out
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isMounted) return;
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
            if (timeoutId) clearTimeout(timeoutId);
            navigate('/dashboard', { replace: true });
          }
        });
        subscription = listener.subscription;

        timeoutId = setTimeout(() => {
          if (isMounted) {
            setErrorMsg('Authentication timed out or was cancelled. Please try signing in again.');
          }
        }, 6000);
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Authentication verification failed.');
        }
      }
    };

    handleAuthCallback();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthLayout
      heading="Verifying Session"
      subheading="Please wait while we authenticate your access."
    >
      <div className="auth-verification-card">
        {errorMsg ? (
          <>
            <div className="verification-icon-box error">
              <AlertCircle size={32} className="text-danger" />
            </div>
            <h3 className="verification-title">Authentication Issue</h3>
            <p className="verification-desc">{errorMsg}</p>
            <div className="verification-actions" style={{ marginTop: '16px' }}>
              <Link to="/login" className="auth-submit-btn">
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="verification-icon-box">
              <div className="auth-spinner large"></div>
            </div>
            <h3 className="verification-title">Confirming Credentials...</h3>
            <p className="verification-desc">
              Establishing a secure connection with AlgoTrack. You will be redirected momentarily.
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
