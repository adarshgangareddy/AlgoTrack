// src/components/workspace/ApiKeyModal.tsx
// Secure BYOK Modal: Connect Personal Groq API Key

import React, { useState } from 'react';
import { 
  KeyRound, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Trash2, 
  ShieldCheck,
  Check,
  BookOpen
} from 'lucide-react';
import { 
  verifyGroqApiKey, 
  saveGroqApiKey, 
  deleteGroqApiKey,
  type UserAiUsageSummary 
} from '../../services/aiService';
import './ApiKeyModal.css';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageSummary: UserAiUsageSummary | null;
  onKeyUpdated: () => void;
  token?: string | null;
  userId?: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  usageSummary,
  onKeyUpdated,
  token,
  userId,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!inputKey.trim()) {
      setErrorMessage('Please enter your Groq API key first.');
      return;
    }
    setErrorMessage(null);
    setVerifySuccess(null);
    setIsVerifying(true);

    try {
      const res = await verifyGroqApiKey(inputKey.trim(), token, userId);
      setVerifySuccess(`Key verified successfully with model: ${res.model}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Key verification failed. Please check your key.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setErrorMessage('Please paste your Groq API key.');
      return;
    }
    setErrorMessage(null);
    setVerifySuccess(null);
    setIsSaving(true);

    try {
      await saveGroqApiKey(inputKey.trim(), token, userId);
      setInputKey('');
      setVerifySuccess('Personal Groq API key connected securely!');
      onKeyUpdated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save Groq API key.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your personal Groq API key?')) {
      return;
    }
    setErrorMessage(null);
    setIsDeleting(true);

    try {
      await deleteGroqApiKey(token, userId);
      onKeyUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove API key.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isConnected = usageSummary?.hasCustomKey && usageSummary.customKeyStatus === 'connected';

  return (
    <div className="byok-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="byok-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="byok-modal-header">
          <div className="byok-header-title-wrap">
            <div className="byok-key-icon-badge">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="byok-modal-title">AI Provider Settings</h2>
              <span className="byok-modal-subtitle">Bring Your Own Key (BYOK) &bull; Groq</span>
            </div>
          </div>
          <button type="button" className="byok-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="byok-modal-body">
          {/* Status Banner */}
          <div className={`byok-status-card ${isConnected ? 'connected' : 'unconfigured'}`}>
            <div className="byok-status-left">
              <span className="byok-status-dot"></span>
              <div>
                <span className="byok-status-label">
                  {isConnected ? 'Personal Key Connected' : 'Using AlgoTrack Free Tier'}
                </span>
                <span className="byok-status-sub">
                  {isConnected
                    ? `Active Key: ${usageSummary.customKeyMasked || 'gsk_••••••••••••••••'}`
                    : `Free requests: ${usageSummary?.freeRequestsRemaining ?? 3} / ${usageSummary?.freeRequestsLimit ?? 3} remaining`}
                </span>
              </div>
            </div>
            {isConnected && (
              <button
                type="button"
                className="byok-remove-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Remove personal key"
              >
                {isDeleting ? <Loader2 size={13} className="spin-icon" /> : <Trash2 size={13} />}
                <span>Remove</span>
              </button>
            )}
          </div>

          {isConnected ? (
            <div className="byok-modal-active-notice">
              <ShieldCheck size={16} color="#059669" />
              <span>Your personal Groq API key is verified and active. Paste a new key below only if you want to replace it.</span>
            </div>
          ) : (
            <>
              <p className="byok-explanation">
                To continue using the AI Tutor after your 3 free requests, create your own Groq API key and securely connect it to AlgoTrack. Your key is encrypted with AES-256-GCM and never shared.
              </p>

              {/* Quick Setup Dashboard Banner */}
              <div className="byok-modal-guide-banner">
                <button
                  type="button"
                  className="byok-modal-guide-btn"
                  onClick={() => window.open('/groq-api-setup', '_blank')}
                  title="Open Step-by-Step API Creation Dashboard"
                >
                  <div className="byok-modal-guide-left">
                    <BookOpen size={15} color="#0284C7" />
                    <span>API Creation Documentation &amp; Setup Dashboard</span>
                  </div>
                  <ExternalLink size={13} color="#0284C7" />
                </button>
              </div>

              {/* Quick Steps & Links */}
              <div className="byok-links-card">
                <div className="byok-links-title">How to get a free Groq API Key:</div>
                <ol className="byok-steps-list">
                  <li>
                    <a
                      href="/groq-api-setup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="byok-external-link"
                    >
                      <strong>Open Step-by-Step Walkthrough Dashboard ↗</strong>
                    </a>
                  </li>
                  <li>
                    Sign in to the{' '}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="byok-external-link"
                    >
                      Official Groq Console Keys <ExternalLink size={11} />
                    </a>
                  </li>
                  <li>Generate a new key and copy the key starting with <code>gsk_</code></li>
                  <li>Paste the key in the field below and click Save Key</li>
                </ol>
                <div className="byok-docs-row">
                  <a
                    href="https://console.groq.com/docs/quickstart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="byok-docs-link"
                  >
                    Read Groq Quickstart Documentation <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Key Input Form */}
          <form onSubmit={handleSave} className="byok-form">
            <label htmlFor="groq-api-key-input" className="byok-form-label">
              {isConnected ? 'Update Groq API Key' : 'Paste Your Groq API Key'}
            </label>
            <div className="byok-input-row">
              <input
                id="groq-api-key-input"
                type="password"
                className="byok-key-input"
                placeholder="gsk_..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="byok-banner error">
                <AlertCircle size={14} className="banner-icon" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {verifySuccess && (
              <div className="byok-banner success">
                <CheckCircle2 size={14} className="banner-icon" />
                <span>{verifySuccess}</span>
              </div>
            )}

            {/* Security Callout */}
            <div className="byok-security-note">
              <ShieldCheck size={14} color="#10B981" />
              <span>Keys are encrypted at rest with AES-256-GCM. We never expose decrypted keys.</span>
            </div>

            {/* Form Actions */}
            <div className="byok-actions-row">
              <button
                type="button"
                className="byok-btn byok-btn-secondary"
                onClick={handleVerify}
                disabled={!inputKey.trim() || isVerifying || isSaving}
              >
                {isVerifying ? <Loader2 size={14} className="spin-icon" /> : null}
                <span>Verify Connection</span>
              </button>

              <button
                type="submit"
                className="byok-btn byok-btn-primary"
                disabled={!inputKey.trim() || isSaving || isVerifying}
              >
                {isSaving ? <Loader2 size={14} className="spin-icon" /> : <Check size={14} />}
                <span>Verify & Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

