// src/components/workspace/AIAssistant.tsx
// AlgoTrack — AI Problem Explainer & Interactive Tutor Component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Send, 
  Key, 
  Lightbulb, 
  ShieldAlert, 
  Clock, 
  HelpCircle, 
  RefreshCw,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { 
  askGeminiAI, 
  getGeminiApiKey, 
  saveGeminiApiKey, 
  type ChatMessage, 
  type ProblemContext 
} from '../../services/aiService';
import './AIAssistant.css';

interface AIAssistantProps {
  problem: ProblemContext;
  autoExplainOnMount?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ problem, autoExplainOnMount = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'greeting',
      sender: 'ai',
      text: `👋 **Welcome! I'm your AlgoTrack AI Tutor.**\n\nI can explain **${problem.title}**, reveal its optimal algorithmic pattern, walk through tricky edge cases, or answer any coding questions.\n\n*Click a quick prompt below or type your question!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getGeminiApiKey());
  const [hasApiKey, setHasApiKey] = useState(() => Boolean(getGeminiApiKey()));
  const [saveKeySuccess, setSaveKeySuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendPrompt = useCallback(async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReplyText = await askGeminiAI({
        problem,
        userPrompt: promptText.trim(),
        history: messages,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue processing your question. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, problem, messages]);

  // Handle auto-explain on mount
  useEffect(() => {
    if (autoExplainOnMount) {
      handleSendPrompt(`Can you explain this problem: ${problem.title}? What is the core intuition and optimal approach?`);
    }
  }, [autoExplainOnMount, handleSendPrompt, problem.title]);

  const handleSaveApiKey = () => {
    saveGeminiApiKey(apiKeyInput.trim());
    setHasApiKey(Boolean(apiKeyInput.trim()));
    setSaveKeySuccess(true);
    setTimeout(() => {
      setSaveKeySuccess(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const renderFormattedText = (text: string) => {
    // Simple fast markdown parser for clean presentation
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="ai-md-h3">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={idx} className="ai-md-h4">{line.replace('#### ', '')}</h5>;
      }
      if (line.startsWith('> ')) {
        return <blockquote key={idx} className="ai-md-quote">{line.replace('> ', '')}</blockquote>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ai-md-li">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      }
      if (line.trim().length === 0) {
        return <div key={idx} className="ai-md-spacer" />;
      }
      return <p key={idx} className="ai-md-p">{line}</p>;
    });
  };

  return (
    <div className="ai-assistant-wrapper">
      {/* Header bar */}
      <div className="ai-assistant-header">
        <div className="ai-header-left">
          <div className="ai-sparkle-box">
            <Sparkles size={16} color="#0284C7" />
          </div>
          <div>
            <span className="ai-header-title">AlgoTrack AI Tutor</span>
            <div className="ai-header-badge-row">
              <span className={`ai-mode-pill ${hasApiKey ? 'live' : 'smart'}`}>
                {hasApiKey ? 'Gemini 1.5 Live' : 'Smart Engine'}
              </span>
            </div>
          </div>
        </div>

        <button 
          type="button" 
          className="ai-key-btn" 
          onClick={() => setShowKeyModal(true)}
          title="Configure Google Gemini API Key"
        >
          <Key size={14} />
          <span>{hasApiKey ? 'API Key Active' : 'Set Gemini Key'}</span>
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="ai-quick-chips-row">
        <button
          type="button"
          className="ai-chip-btn"
          onClick={() => handleSendPrompt(`Can you explain the problem "${problem.title}" in simple terms with an example?`)}
          disabled={isLoading}
        >
          <Lightbulb size={13} color="#F59E0B" />
          <span>Explain Problem</span>
        </button>

        <button
          type="button"
          className="ai-chip-btn"
          onClick={() => handleSendPrompt(`What is the optimal algorithmic pattern for "${problem.title}", and why does it work?`)}
          disabled={isLoading}
        >
          <Sparkles size={13} color="#0284C7" />
          <span>Optimal Pattern</span>
        </button>

        <button
          type="button"
          className="ai-chip-btn"
          onClick={() => handleSendPrompt(`What are the most common edge cases and pitfalls for "${problem.title}"?`)}
          disabled={isLoading}
        >
          <ShieldAlert size={13} color="#EF4444" />
          <span>Edge Cases</span>
        </button>

        <button
          type="button"
          className="ai-chip-btn"
          onClick={() => handleSendPrompt(`Can you give me a progressive hint without spoiling the full code for "${problem.title}"?`)}
          disabled={isLoading}
        >
          <HelpCircle size={13} color="#10B981" />
          <span>Give Me a Hint</span>
        </button>

        <button
          type="button"
          className="ai-chip-btn"
          onClick={() => handleSendPrompt(`Analyze the time and space complexity for "${problem.title}". What is the tight asymptotic bound?`)}
          disabled={isLoading}
        >
          <Clock size={13} color="#6366F1" />
          <span>Complexity</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="ai-messages-container">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`ai-message-bubble-wrap ${msg.sender === 'user' ? 'user-wrap' : 'ai-wrap'}`}
          >
            {msg.sender === 'ai' && (
              <div className="ai-avatar-tiny">
                <Sparkles size={12} color="#FFFFFF" />
              </div>
            )}
            <div className={`ai-message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
              <div className="ai-message-content">
                {renderFormattedText(msg.text)}
              </div>
              <span className="ai-message-time">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="ai-message-bubble-wrap ai-wrap">
            <div className="ai-avatar-tiny">
              <Sparkles size={12} color="#FFFFFF" />
            </div>
            <div className="ai-message-bubble ai-bubble ai-loading-bubble">
              <RefreshCw size={14} className="spin-icon" />
              <span>Analyzing problem with AI...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        className="ai-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(inputText);
        }}
      >
        <input 
          type="text"
          className="ai-text-input"
          placeholder="Ask AI anything about this problem... (e.g. 'Can you explain this step by step?')"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="ai-send-btn"
          disabled={isLoading || !inputText.trim()}
          title="Send Question"
        >
          <Send size={15} />
        </button>
      </form>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="ai-modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="ai-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <div className="ai-modal-title-row">
                <Key size={18} color="#0284C7" />
                <h3>Google Gemini API Key</h3>
              </div>
              <button 
                type="button" 
                className="ai-modal-close"
                onClick={() => setShowKeyModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="ai-modal-desc">
              Connect your free Google Gemini API key to enable live, conversational AI answers tailored to any algorithm challenge.
            </p>

            <div className="ai-modal-field">
              <label htmlFor="gemini-key-input">Gemini API Key</label>
              <input 
                id="gemini-key-input"
                type="password"
                className="ai-key-input-field"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>

            <div className="ai-modal-actions">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ai-get-free-key-link"
              >
                <span>Get Free Gemini Key</span>
                <ExternalLink size={13} />
              </a>

              <div className="ai-modal-btn-group">
                <button 
                  type="button" 
                  className="ai-btn-secondary"
                  onClick={() => {
                    setApiKeyInput('');
                    saveGeminiApiKey('');
                    setHasApiKey(false);
                    setShowKeyModal(false);
                  }}
                >
                  Clear Key
                </button>

                <button 
                  type="button" 
                  className="ai-btn-primary"
                  onClick={handleSaveApiKey}
                >
                  {saveKeySuccess ? (
                    <>
                      <Check size={14} />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Key</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
