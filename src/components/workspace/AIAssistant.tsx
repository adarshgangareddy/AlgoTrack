// src/components/workspace/AIAssistant.tsx
// AlgoTrack: ChatGPT-Inspired DSA Theory & Concepts Mentor

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
  Bot,
  User as UserIcon
} from 'lucide-react';
import { 
  askGroqAI, 
  checkAiStatus, 
  type ChatMessage, 
  type ProblemContext 
} from '../../services/aiService';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Send prompt to Groq backend
  const handleSendPrompt = useCallback(
    async (params: { action?: string; question?: string }) => {
      const { action, question } = params;
      if (isLoading) return;

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

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setIsLoading(true);
      setLastFailedPrompt(null);

      // Prepare conversation history (exclude initial greeting)
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

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
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
    [isLoading, messages, problem, language, code, userId, userToken]
  );

  const handleClearConversation = () => {
    if (window.confirm('Reset this chat conversation?')) {
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
    // Auto-adjust textarea height
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="chatgpt-ai-tutor-container">
      {/* 1. Compact Header */}
      <div className="chatgpt-header">
        <div className="chatgpt-header-left">
          <div className="chatgpt-avatar-badge">
            <Sparkles size={16} />
          </div>
          <div className="chatgpt-header-titles">
            <h2 className="chatgpt-title">DSA Theory & Concepts Mentor</h2>
            <div className="chatgpt-badges-row">
              <span className="chatgpt-pill-theory">Theory Only</span>
              <span className="chatgpt-model-name">{modelName.split('-')[0]}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="chatgpt-btn-reset"
          onClick={handleClearConversation}
          title="Reset conversation"
          aria-label="Reset conversation"
        >
          <Trash2 size={14} />
          <span className="btn-reset-label">Clear</span>
        </button>
      </div>

      {/* 2. Scrollable Messages Area */}
      <div className="chatgpt-messages-viewport">
        <div className="chatgpt-messages-thread">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chatgpt-message-row ${msg.sender === 'user' ? 'user-row' : 'assistant-row'}`}
            >
              {msg.sender === 'ai' && (
                <div className="message-avatar-ai" aria-hidden="true">
                  <Bot size={16} />
                </div>
              )}

              <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble'} ${msg.isError ? 'error-bubble' : ''}`}>
                {msg.sender === 'user' ? (
                  <p className="user-text-content">{msg.text}</p>
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}
                <span className="message-timestamp">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' && (
                <div className="message-avatar-user" aria-hidden="true">
                  <UserIcon size={14} />
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking Animation */}
          {isLoading && (
            <div className="chatgpt-message-row assistant-row">
              <div className="message-avatar-ai thinking" aria-hidden="true">
                <Loader2 size={16} className="spin-icon" />
              </div>
              <div className="message-bubble assistant-bubble thinking-bubble">
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

      {/* 3. Bottom Pinned Composer Area */}
      <div className="chatgpt-composer-pinned">
        {/* Quick Actions Scroll Strip */}
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
                <Icon size={13} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* ChatGPT Style Input Box */}
        <div className="chatgpt-composer-box">
          <textarea
            ref={textareaRef}
            className="chatgpt-textarea"
            placeholder={`Ask about "${problem.title}" intuition, patterns, dry runs...`}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
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
            disabled={!inputText.trim() || isLoading}
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
    </div>
  );
};
