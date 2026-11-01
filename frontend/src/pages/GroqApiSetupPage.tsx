// src/pages/GroqApiSetupPage.tsx
// Dedicated Dashboard: Groq API Creation Documentation & Interactive BYOK Setup

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  KeyRound, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  ShieldCheck, 
  Check, 
  ArrowLeft,
  Sparkles,
  Zap,
  Copy,
  Terminal,
  Shield,
  Eye,
  EyeOff,
  BookOpen
} from 'lucide-react';
import { AppNavbar } from '../components/layout/AppNavbar';
import { useAuth } from '../context/AuthContext';
import { 
  fetchAiUsage, 
  verifyGroqApiKey, 
  saveGroqApiKey, 
  deleteGroqApiKey, 
  type UserAiUsageSummary 
} from '../services/aiService';
import './GroqApiSetupPage.css';

export const GroqApiSetupPage: React.FC = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [aiUsage, setAiUsage] = useState<UserAiUsageSummary | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load usage state
  const loadUsage = async () => {
    if (user?.id) {
      try {
        const data = await fetchAiUsage(session?.access_token, user.id);
        setAiUsage(data);
      } catch (err) {
        console.error('Failed to load AI usage:', err);
      }
    }
  };

  useEffect(() => {
    loadUsage();
  }, [user?.id, session?.access_token]);

  const isConnected = aiUsage?.hasCustomKey && aiUsage.customKeyStatus === 'connected';

  // Handle live test verification
  const handleVerify = async () => {
    if (!apiKeyInput.trim()) {
      setErrorMessage('Please paste your Groq API key first (must start with gsk_).');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsVerifying(true);

    try {
      const res = await verifyGroqApiKey(apiKeyInput.trim(), session?.access_token, user?.id);
      setSuccessMessage(`API Key verified successfully! Model active: ${res.model}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please ensure the key starts with gsk_ and is active.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle save & connect
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setErrorMessage('Please paste your Groq API key.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await saveGroqApiKey(apiKeyInput.trim(), session?.access_token, user?.id);
      setSuccessMessage('Groq API Key connected securely! Unlimited AI Tutor access is now unlocked.');
      setApiKeyInput('');
      await loadUsage();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save API key. Please check your network and key format.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete key
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your personal Groq API key? You will revert to the standard free tier.')) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDeleting(true);

    try {
      await deleteGroqApiKey(session?.access_token, user?.id);
      setSuccessMessage('Personal API key removed. Reverted to standard tier.');
      await loadUsage();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove API key.');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyGroqConsoleUrl = () => {
    navigator.clipboard.writeText('https://console.groq.com/keys');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="groq-docs-dashboard">
      <AppNavbar />

      <main className="groq-docs-container">
        {/* Top Breadcrumb & Back Action */}
        <div className="groq-docs-top-nav">
          <button 
            type="button" 
            className="groq-back-btn" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="groq-badge-row">
            <span className="groq-tag-badge">Official Groq Cloud Guide</span>
            <span className="groq-tag-badge secondary">BYOK Integration</span>
          </div>
        </div>

        {/* Hero Section */}
        <header className="groq-docs-hero">
          <div className="groq-hero-icon-wrap">
            <KeyRound size={28} className="groq-hero-icon" />
          </div>
          <div className="groq-hero-text">
            <h1 className="groq-hero-title">Groq API Creation & BYOK Setup Dashboard</h1>
            <p className="groq-hero-subtitle">
              Follow this step-by-step documentation to generate your free official Groq API key.
              Connect it below to unlock continuous, zero-rate-limit AI Tutor assistance in your AlgoTrack problem workspace.
            </p>
          </div>

          <div className="groq-hero-actions">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="groq-primary-external-btn"
            >
              <ExternalLink size={16} />
              <span>Open Official Groq Console</span>
            </a>
            <button
              type="button"
              className="groq-secondary-btn"
              onClick={copyGroqConsoleUrl}
              title="Copy Groq Keys URL"
            >
              <Copy size={14} />
              <span>{copiedLink ? 'Copied URL!' : 'Copy Console URL'}</span>
            </button>
          </div>
        </header>

        {/* Live Status & Quota Banner */}
        <section className={`groq-live-status-card ${isConnected ? 'connected' : 'free'}`}>
          <div className="status-card-content">
            <div className="status-indicator-dot" />
            <div className="status-text-block">
              <div className="status-title-row">
                <span className="status-header-label">CURRENT AI TUTOR STATUS</span>
                <span className={`status-pill ${isConnected ? 'status-pill-green' : 'status-pill-amber'}`}>
                  {isConnected ? 'Personal Key Connected' : 'Free Tier Active'}
                </span>
              </div>
              <p className="status-summary-text">
                {isConnected ? (
                  <>
                    Active Key: <code className="masked-key">{aiUsage?.customKeyMasked || 'gsk_••••••••••••••••'}</code> &bull; 
                    <strong style={{ color: '#059669', marginLeft: '6px' }}>Unlimited Mentoring Unlocked</strong>
                  </>
                ) : (
                  <>
                    Free Application Quota: <strong>{aiUsage?.freeRequestsRemaining ?? 3} / {aiUsage?.freeRequestsLimit ?? 3} remaining</strong>.
                    {(aiUsage?.freeRequestsRemaining ?? 3) === 0 ? (
                      <span className="status-exhausted-alert"> Quota exhausted! Connect your free key below to continue.</span>
                    ) : (
                      ' Connect your key at any time for unlimited access.'
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          {isConnected && (
            <button 
              type="button" 
              className="groq-remove-key-btn"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 size={13} className="spin-icon" /> : <Trash2 size={13} />}
              <span>Disconnect Key</span>
            </button>
          )}
        </section>

        {/* Main Steps Grid */}
        <section className="groq-steps-section">
          <div className="section-header-row">
            <BookOpen size={20} color="#0284C7" />
            <h2 className="section-heading">Step-by-Step API Key Creation Guide</h2>
          </div>

          <div className="groq-steps-list">
            
            {/* Step 1 */}
            <div className="groq-step-card">
              <div className="step-num-badge">1</div>
              <div className="step-card-content">
                <div className="step-title-row">
                  <h3 className="step-title">Open the Official Groq Console</h3>
                  <a 
                    href="https://console.groq.com/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="step-inline-link"
                  >
                    <span>console.groq.com/keys</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <p className="step-desc">
                  Groq provides ultra-fast LPU inference (running Llama 3.3 70B & Llama 3.1 8B) for free with generous daily token limits. 
                  Click the button below to open the official Groq Cloud console in a new browser tab.
                </p>
                <div className="step-action-bar">
                  <a 
                    href="https://console.groq.com/keys" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="step-direct-cta"
                  >
                    <span>Launch Groq Console ↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="groq-step-card">
              <div className="step-num-badge">2</div>
              <div className="step-card-content">
                <h3 className="step-title">Sign In or Create a Free Account</h3>
                <p className="step-desc">
                  Sign in using your <strong>Google Account</strong>, <strong>GitHub</strong>, or an email address. 
                  No credit card or billing information is required for personal developer use.
                </p>
                <div className="step-tip-box">
                  <Sparkles size={14} color="#0284C7" />
                  <span>Tip: If you already have a Google account connected to AlgoTrack, choosing "Continue with Google" on Groq takes just 5 seconds.</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="groq-step-card">
              <div className="step-num-badge">3</div>
              <div className="step-card-content">
                <h3 className="step-title">Navigate to "API Keys"</h3>
                <p className="step-desc">
                  In the Groq Cloud dashboard sidebar on the left, locate and click on <strong>API Keys</strong>. 
                  If you used the direct link from Step 1, you will land on this page automatically.
                </p>
                <div className="step-visual-mock">
                  <Terminal size={14} />
                  <span>Sidebar Menu &gt; <strong>API Keys</strong> (https://console.groq.com/keys)</span>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="groq-step-card">
              <div className="step-num-badge">4</div>
              <div className="step-card-content">
                <h3 className="step-title">Click "Create API Key"</h3>
                <p className="step-desc">
                  Look for the orange or blue button labeled <strong>"Create API Key"</strong> in the top-right area of the keys table. 
                  Provide an optional label (e.g. <code>AlgoTrack AI Tutor</code>) to keep track of where this key is used.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="groq-step-card">
              <div className="step-num-badge">5</div>
              <div className="step-card-content">
                <h3 className="step-title">Copy Your Secret Key Immediately</h3>
                <p className="step-desc">
                  Groq will generate a key starting with <code>gsk_...</code> followed by a random string of characters. 
                  Click the <strong>Copy</strong> icon next to the key.
                </p>
                <div className="step-alert-box">
                  <Shield size={14} color="#D97706" />
                  <span>Important: Groq displays this secret key only once for security. Copy it now before closing their modal!</span>
                </div>
                <div className="step-code-preview">
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', fontStyle: 'italic' }}>
                    Visual format example (dummy placeholder — generate your real key above):
                  </div>
                  <code>gsk_w4X9kLmP02qRsTuVwXyZ1234567890abcdefghijklmn</code>
                </div>
              </div>
            </div>

            {/* Step 6: PASTE & CONNECT OPTION (Requested by user!) */}
            <div className="groq-step-card step-highlight-card" id="step-paste-key">
              <div className="step-num-badge active-num">6</div>
              <div className="step-card-content">
                <div className="step-title-row">
                  <h3 className="step-title">Paste &amp; Connect Your Groq API Key</h3>
                  <span className="step-ready-pill">Final Step</span>
                </div>
                <p className="step-desc">
                  Paste the <code>gsk_...</code> key you just copied below and click <strong>Verify &amp; Save Key</strong>. 
                  AlgoTrack encrypts your key using <strong>AES-256-GCM</strong> authenticated encryption. Your key is stored securely and never shared.
                </p>

                {/* Paste & Connect Form */}
                <form onSubmit={handleSave} className="groq-paste-form">
                  <div className="groq-input-wrap">
                    <label htmlFor="groq-key-input" className="groq-input-label">
                      Groq API Key (starts with <code>gsk_</code>)
                    </label>
                    <div className="groq-input-container">
                      <KeyRound size={16} className="groq-input-icon" />
                      <input
                        id="groq-key-input"
                        type={showKeyText ? 'text' : 'password'}
                        className="groq-text-input"
                        placeholder="gsk_..."
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <button
                        type="button"
                        className="groq-reveal-btn"
                        onClick={() => setShowKeyText(!showKeyText)}
                        title={showKeyText ? 'Hide key' : 'Show key'}
                      >
                        {showKeyText ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="groq-feedback-alert error">
                      <AlertCircle size={15} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="groq-feedback-alert success">
                      <CheckCircle2 size={15} />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="groq-form-buttons-row">
                    <button
                      type="button"
                      className="groq-verify-btn"
                      onClick={handleVerify}
                      disabled={!apiKeyInput.trim() || isVerifying || isSaving}
                    >
                      {isVerifying ? <Loader2 size={14} className="spin-icon" /> : <Zap size={14} />}
                      <span>Test &amp; Verify Key</span>
                    </button>

                    <button
                      type="submit"
                      className="groq-save-btn"
                      disabled={!apiKeyInput.trim() || isSaving || isVerifying}
                    >
                      {isSaving ? <Loader2 size={14} className="spin-icon" /> : <Check size={14} />}
                      <span>Save &amp; Connect Key</span>
                    </button>
                  </div>
                </form>

                {/* Return to workspace CTA when connected */}
                {isConnected && (
                  <div className="groq-connected-celebration">
                    <div className="celebration-left">
                      <ShieldCheck size={20} color="#10B981" />
                      <div>
                        <strong>Key Active &amp; Ready</strong>
                        <p>Your input count is unlocked. Unlimited AI requests are now available in your problem workspace.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="groq-return-workspace-btn"
                      onClick={() => navigate('/problems')}
                    >
                      <span>Return to Problems →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Security & FAQ Section */}
        <section className="groq-faq-section">
          <div className="faq-header">
            <ShieldCheck size={20} color="#059669" />
            <h3 className="faq-title">Security &amp; Privacy Guarantee</h3>
          </div>
          <div className="faq-grid">
            <div className="faq-card">
              <h4>Is Groq really free?</h4>
              <p>
                Yes. Groq Cloud currently provides generous free tier rate limits (approx. 30 requests per minute and 14,400 per day on Llama models), making it ideal for daily algorithmic problem practice.
              </p>
            </div>
            <div className="faq-card">
              <h4>How does AlgoTrack secure my key?</h4>
              <p>
                Keys are encrypted server-side using AES-256-GCM. We never log your key, never send it back in plain text, and only decrypt it momentarily in memory when dispatching an AI tutoring prompt to Groq.
              </p>
            </div>
            <div className="faq-card">
              <h4>Can I remove my key anytime?</h4>
              <p>
                Yes. You can disconnect your key at any moment using the "Disconnect Key" button above or via your Profile settings.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default GroqApiSetupPage;
