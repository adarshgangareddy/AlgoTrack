import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          navigate('/dashboard', { replace: true });
        } else {
          // If no session yet, wait briefly and check URL hash
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1200);
        }
      } catch {
        setErrorMsg('Authentication verification failed.');
      }
    };

    handleAuthCallback();
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
