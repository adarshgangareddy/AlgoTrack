// src/components/workspace/AIAssistant.tsx
// AlgoTrack: ChatGPT-Inspired DSA Theory & Concepts Mentor with BYOK & Usage Management

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Clock, 
  HelpCircle, 
  Loader2, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Lightbulb, 
  Compass, 
  ArrowUp, 
  ArrowDown,
  KeyRound,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  askGroqAI, 
  checkAiStatus, 
  fetchAiUsage,
  type ChatMessage, 
  type ProblemContext,
  type UserAiUsageSummary
} from '../../services/aiService';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { ApiKeyModal } from './ApiKeyModal';
import './AIAssistant.css';

interface AIAssistantProps {
  problem: ProblemContext;
  code?: string;
  language?: string;
  userId?: string | null;
  userToken?: string | null;
}

const QUICK_ACTIONS = [
  { id: 'explain_concept', label: 'Explain the Core Concept', icon: Lightbulb },
  { id: 'pattern', label: 'Teach the Algorithmic Pattern', icon: Compass },
  { id: 'intuition', label: 'Explain the Intuition', icon: Sparkles },
  { id: 'dry_run', label: 'Walk Through an Example', icon: RotateCcw },
  { id: 'complexity', label: 'Explain Time Complexity', icon: Clock },
  { id: 'hint', label: 'Give Me a Hint', icon: HelpCircle },
  { id: 'edge_cases', label: 'Explain Edge Cases', icon: AlertTriangle },
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  problem, 
  code = '', 
  language = 'python',
  userId,
  userToken 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'greeting',
      sender: 'ai',
      text: `👋 **Welcome! I'm your DSA Theory & Concepts Mentor.**\n\nI can explain problem intuition, underlying algorithmic patterns, step-by-step example dry runs, and time/space complexity for **${problem.title}**.\n\n*To ensure authentic interview mastery, I guide your conceptual understanding without giving away complete copy-paste code.*\n\nChoose a quick suggestion below or ask any question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<{ action?: string; question?: string } | null>(null);
  const [modelName, setModelName] = useState('llama-3.3-70b-versatile');

  // BYOK & Usage State
  const [usageSummary, setUsageSummary] = useState<UserAiUsageSummary | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Scroll & Dynamic Header Visibility State
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastUserPromptIdRef = useRef<string | null>(null);
  const shouldScrollToPromptRef = useRef<boolean>(false);
  const lastScrollTopRef = useRef<number>(0);

  // Fetch Usage Summary
  const refreshUsage = useCallback(async () => {
    if (userId) {
      try {
        const summary = await fetchAiUsage(userToken, userId);
        setUsageSummary(summary);
        if (!summary.hasCustomKey && summary.freeRequestsRemaining <= 0) {
          setIsLimitReached(true);
        } else {
          setIsLimitReached(false);
        }
      } catch {
        // ignore
      }
    }
  }, [userId, userToken]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  // Check backend configuration
  useEffect(() => {
    let isMounted = true;
    checkAiStatus().then((status) => {
      if (isMounted) {
        if (status.model) setModelName(status.model);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Handle Scroll: intelligent down-arrow + header auto-hide/reveal
  const handleScroll = () => {
    if (!viewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;

    // 1. Floating scroll-to-bottom arrow visibility
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollBottom(isScrolledUp);

    // 2. Hide header and quick actions on scroll down, reveal on scroll up
    const currentScrollTop = scrollTop;
    const scrollDelta = currentScrollTop - lastScrollTopRef.current;

    if (scrollDelta > 10 && currentScrollTop > 50) {
      // Scrolling down -> hide header & quick actions to maximize chat space
      setIsHeaderVisible(false);
    } else if (scrollDelta < -10 || currentScrollTop <= 20) {
      // Scrolling up -> reveal header & quick actions smoothly
      setIsHeaderVisible(true);
    }

    lastScrollTopRef.current = currentScrollTop;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll anchoring: Keep view stable at the active prompt, do not force-scroll if reading older messages
  useEffect(() => {
    if (shouldScrollToPromptRef.current && lastUserPromptIdRef.current) {
      const el = document.getElementById(`chat-msg-${lastUserPromptIdRef.current}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        shouldScrollToPromptRef.current = false;
      }
      return;
    }

    // Auto-scroll to latest response ONLY if user is already near bottom
    if (viewportRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 140;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  // Send prompt to Groq backend
  const handleSendPrompt = useCallback(
    async (params: { action?: string; question?: string }) => {
      const { action, question } = params;
      if (isLoading) return;

      // Check client-side limit if known
      if (
        usageSummary &&
        !usageSummary.hasCustomKey &&
        usageSummary.freeRequestsRemaining <= 0
      ) {
        setIsLimitReached(true);
        setIsApiKeyModalOpen(true);
        return;
      }

      const userDisplayText = question 
        ? question.trim() 
        : (QUICK_ACTIONS.find(a => a.id === action)?.label || `Action: ${action}`);

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userDisplayText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };

      lastUserPromptIdRef.current = userMsg.id;
      shouldScrollToPromptRef.current = true;
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setIsLoading(true);
      setLastFailedPrompt(null);

      // Prepare conversation history
      const chatHistory = messages
        .filter((m) => m.id !== 'greeting' && !m.isError)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      try {
        const response = await askGroqAI({
          problemTitle: problem.title,
          problemDescription: problem.description,
          language,
          code,
          action,
          question,
          examples: problem.examples,
          constraints: problem.constraints,
          theoryContent: problem.theory_content,
          hints: problem.hints,
          messages: chatHistory,
          userId,
          token: userToken,
        });

        if (response.model) {
          setModelName(response.model);
        }

        if (response.usage) {
          setUsageSummary(response.usage);
          if (!response.usage.hasCustomKey && response.usage.freeRequestsRemaining <= 0) {
            setIsLimitReached(true);
          }
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
        if (err.isLimitReached || err.status === 403) {
          setIsLimitReached(true);
        }
        setLastFailedPrompt({ action, question });
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Unable to complete AI request**\n\n${err.message || 'An error occurred while communicating with Groq AI.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, problem, language, code, userId, userToken, usageSummary]
  );

  const handleClearConversation = () => {
    if (window.confirm('Reset this chat conversation?')) {
      lastUserPromptIdRef.current = null;
      shouldScrollToPromptRef.current = false;
      setMessages([
        {
          id: 'greeting',
          sender: 'ai',
          text: `Conversation reset. Ready to explore **${problem.title}**!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setLastFailedPrompt(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isLoading) {
        handleSendPrompt({ question: inputText.trim() });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const isCustomKeyConnected = usageSummary?.hasCustomKey && usageSummary.customKeyStatus === 'connected';

  return (
    <div className="chatgpt-ai-tutor-container">
      {/* 1. Collapsible Header (Hides smoothly on downward scroll, reveals on upward scroll) */}
      <div className={`chatgpt-header ${isHeaderVisible ? 'visible' : 'collapsed'}`}>
        <div className="chatgpt-header-left">
          <div className="chatgpt-avatar-badge">
            <Sparkles size={16} />
          </div>
          <div className="chatgpt-header-titles">
            <div className="chatgpt-title-row">
              <h2 className="chatgpt-title">DSA Theory & Concepts Mentor</h2>
              <span className="chatgpt-pill-theory">Theory Only</span>
            </div>
            <div className="chatgpt-badges-row">
              <span className="chatgpt-model-name">{modelName.split('/').pop()?.split('-')[0] || 'Groq'}</span>
              <span className="chatgpt-meta-bullet">&bull;</span>
              {/* Usage Indicator Badge */}
              {isCustomKeyConnected ? (
                <button
                  type="button"
                  className="chatgpt-usage-pill byok-pill"
                  onClick={() => setIsApiKeyModalOpen(true)}
                  title="Using your personal Groq API key (Click to manage)"
                >
                  <ShieldCheck size={11} color="#10B981" />
                  <span>Personal Key</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`chatgpt-usage-pill free-pill ${
                    (usageSummary?.freeRequestsRemaining ?? 3) <= 1 ? 'warning' : ''
                  }`}
                  onClick={() => setIsApiKeyModalOpen(true)}
                  title="Click to view usage and connect personal key"
                >
                  <Zap size={10} />
                  <span>Free AI: {usageSummary?.freeRequestsRemaining ?? 3} / {usageSummary?.freeRequestsLimit ?? 3} left</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="chatgpt-header-actions">
          {/* Key Settings Button */}
          <button
            type="button"
            className="chatgpt-btn-key"
            onClick={() => setIsApiKeyModalOpen(true)}
            title="Configure Personal Groq API Key"
            aria-label="API Settings"
          >
            <KeyRound size={13} />
            <span className="btn-key-label">Key</span>
          </button>

          {/* Reset Chat Button */}
          <button
            type="button"
            className="chatgpt-btn-reset"
            onClick={handleClearConversation}
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <Trash2 size={13} />
            <span className="btn-reset-label">Clear</span>
          </button>
        </div>
      </div>

      {/* 2. Collapsible Quick Actions Strip (Hides smoothly on downward scroll) */}
      <div className={`chatgpt-quick-strip-container ${isHeaderVisible ? 'visible' : 'collapsed'}`}>
        <div className="chatgpt-quick-actions-strip">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className="quick-action-pill"
                onClick={() => handleSendPrompt({ action: action.id })}
                disabled={isLoading}
              >
                <Icon size={12} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Scrollable Messages Area */}
      <div 
        className="chatgpt-messages-viewport" 
        ref={viewportRef}
        onScroll={handleScroll}
      >
        <div className="chatgpt-messages-thread">
          {/* Free Request Notice when 1 Left */}
          {!isCustomKeyConnected && usageSummary?.freeRequestsRemaining === 1 && (
            <div className="chatgpt-notice-strip warning">
              <AlertTriangle size={13} />
              <span>You have 1 free AI request remaining. Add your personal Groq key for unlimited practice.</span>
              <button
                type="button"
                className="notice-action-link"
                onClick={() => setIsApiKeyModalOpen(true)}
              >
                Configure Key
              </button>
            </div>
          )}

          {/* Limit Reached Upgrade Banner */}
          {isLimitReached && !isCustomKeyConnected && (
            <div className="chatgpt-limit-reached-card">
              <div className="limit-card-top">
                <AlertTriangle size={16} color="#D97706" />
                <span className="limit-card-title">Free AI Message Limit Reached (3/3)</span>
              </div>
              <p className="limit-card-desc">
                You've completed your 3 free application requests. Connect your own free Groq API key to continue uninterrupted DSA mentoring.
              </p>
              <button
                type="button"
                className="limit-card-cta-btn"
                onClick={() => setIsApiKeyModalOpen(true)}
              >
                <KeyRound size={13} />
                <span>Configure My Groq API Key</span>
              </button>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              id={`chat-msg-${msg.id}`}
              className={`chatgpt-message-row ${msg.sender === 'user' ? 'user-row' : 'assistant-row'}`}
            >
              <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble'} ${msg.isError ? 'error-bubble' : ''}`}>
                {msg.sender === 'user' ? (
                  <p className="user-text-content">{msg.text}</p>
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}
                <span className="message-timestamp">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {/* AI Thinking State */}
          {isLoading && (
            <div className="chatgpt-message-row assistant-row">
              <div className="chatgpt-thinking-state">
                <div className="chatgpt-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="thinking-label">Reasoning concepts...</span>
              </div>
            </div>
          )}

          {/* Retry on error */}
          {lastFailedPrompt && !isLoading && (
            <div className="chatgpt-retry-banner">
              <span>Request interrupted.</span>
              <button
                type="button"
                className="chatgpt-retry-btn"
                onClick={() => handleSendPrompt(lastFailedPrompt)}
              >
                <RotateCcw size={13} />
                <span>Retry</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Scroll-to-Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          className="chatgpt-scroll-bottom-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to newest message"
          title="Scroll to bottom"
        >
          <ArrowDown size={15} />
        </button>
      )}

      {/* 4. Bottom Pinned Composer Area */}
      <div className="chatgpt-composer-pinned">
        <div className="chatgpt-composer-box">
          <textarea
            ref={textareaRef}
            className="chatgpt-textarea"
            placeholder={
              isLimitReached && !isCustomKeyConnected
                ? 'Configure your Groq key to message DSA Mentor...'
                : `Ask about "${problem.title}" intuition, patterns, dry runs...`
            }
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || (isLimitReached && !isCustomKeyConnected)}
            rows={1}
            aria-label="Message DSA Mentor"
          />

          <button
            type="button"
            className="chatgpt-send-btn"
            onClick={() => {
              if (inputText.trim() && !isLoading) {
                handleSendPrompt({ question: inputText.trim() });
              }
            }}
            disabled={!inputText.trim() || isLoading || (isLimitReached && !isCustomKeyConnected)}
            aria-label="Send message"
            title="Send (Enter)"
          >
            {isLoading ? (
              <Loader2 size={16} className="spin-icon" />
            ) : (
              <ArrowUp size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>

        <div className="chatgpt-composer-disclaimer">
          DSA Theory Mentor guides algorithmic intuition &bull; Complete solution code is restricted to promote mastery.
        </div>
      </div>

      {/* BYOK Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        usageSummary={usageSummary}
        onKeyUpdated={refreshUsage}
        token={userToken}
        userId={userId}
      />
    </div>
  );
};
