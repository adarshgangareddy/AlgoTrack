// src/components/workspace/AIAssistant.tsx
// AlgoTrack Phase 6: Groq AI Code Assistant & Interactive Mentor

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Send, 
  Clock, 
  HelpCircle, 
  Loader2,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  Compass
} from 'lucide-react';
import { 
  askGroqAI, 
  checkAiStatus, 
  type ChatMessage, 
  type ProblemContext 
} from '../../services/aiService';
import './AIAssistant.css';

interface AIAssistantProps {
  problem: ProblemContext;
  code?: string;
  language?: string;
  userId?: string | null;
  userToken?: string | null;
}

const QUICK_ACTIONS = [
  { id: 'explain_concept', label: 'Explain Concept & Patterns', icon: Lightbulb, color: '#0284C7' },
  { id: 'dry_run', label: 'Step-by-Step Dry Run', icon: RotateCcw, color: '#059669' },
  { id: 'hint', label: 'Give Me a Hint', icon: HelpCircle, color: '#10B981' },
  { id: 'common_mistakes', label: 'Common Mistakes & Edge Cases', icon: AlertTriangle, color: '#DC2626' },
  { id: 'complexity', label: 'Time & Space Complexity', icon: Clock, color: '#7C3AED' },
  { id: 'analyze', label: 'Review My Conceptual Approach', icon: Compass, color: '#EA580C' },
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
      text: `👋 **Welcome! I'm your DSA Theory & Concepts Mentor on AlgoTrack.**\n\nI can explain the core intuition, algorithmic patterns, step-by-step dry runs, and Big-O complexity for **${problem.title}**.\n\n*To ensure true problem-solving mastery, I guide your intuition without giving away complete code solutions.*\n\nClick any quick topic below or ask your own question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<{ action?: string; question?: string } | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [modelName, setModelName] = useState('llama-3.3-70b-versatile');
  const [isConfigured, setIsConfigured] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check backend configuration on mount
  useEffect(() => {
    let isMounted = true;
    checkAiStatus().then((status) => {
      if (isMounted) {
        setIsConfigured(status.configured);
        if (status.model) setModelName(status.model);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Scroll to bottom on new messages
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
      setIsLoading(true);
      setLastFailedPrompt(null);

      // Prepare conversation history (exclude system greeting)
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
    if (window.confirm('Clear your AI conversation history for this session?')) {
      setMessages([
        {
          id: 'greeting',
          sender: 'ai',
          text: `Conversation cleared. Ready to assist with **${problem.title}**!`,
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

  const handleCopySnippet = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSnippetId(id);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Markdown rendering helper with code blocks & copy buttons
  const renderFormattedText = (rawText: string) => {
    // Split text by markdown code blocks ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(rawText)) !== null) {
      const textBefore = rawText.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(renderTextParagraphs(textBefore, `text-${lastIndex}`));
      }

      const blockLang = match[1] || language || 'code';
      const blockCode = match[2];
      const snippetId = `snippet-${match.index}`;

      parts.push(
        <div key={snippetId} className="ai-code-block-container">
          <div className="ai-code-block-header">
            <span className="ai-code-lang">{blockLang}</span>
            <button
              type="button"
              className="ai-code-copy-btn"
              onClick={() => handleCopySnippet(blockCode, snippetId)}
              title="Copy code snippet"
            >
              {copiedSnippetId === snippetId ? (
                <>
                  <Check size={12} color="#10B981" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="ai-code-pre">
            <code>{blockCode}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    const remainingText = rawText.substring(lastIndex);
    if (remainingText) {
      parts.push(renderTextParagraphs(remainingText, `text-${lastIndex}`));
    }

    return parts;
  };

  const renderTextParagraphs = (text: string, keyPrefix: string) => {
    const lines = text.split('\n');
    return (
      <div key={keyPrefix} className="ai-text-block">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={`${keyPrefix}-${idx}`} className="ai-empty-line" />;
          }

          // Headers
          if (line.startsWith('### ')) {
            return <h4 key={`${keyPrefix}-${idx}`} className="ai-h4">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={`${keyPrefix}-${idx}`} className="ai-h3">{line.replace('## ', '')}</h3>;
          }

          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={`${keyPrefix}-${idx}`} className="ai-bullet-line">
                <span className="ai-bullet-dot">•</span>
                <span>{renderInlineFormatting(line.trim().substring(2))}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={`${keyPrefix}-${idx}`} className="ai-numbered-line">
                <span className="ai-numbered-prefix">{numMatch[1]}.</span>
                <span>{renderInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={`${keyPrefix}-${idx}`} className="ai-paragraph">
              {renderInlineFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInlineFormatting = (str: string) => {
    // Bold, inline code
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="ai-inline-code">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const codeLineCount = code ? code.split('\n').length : 0;

  return (
    <div className="ai-assistant-container">
      {/* 1. Header with Model Info & Actions */}
      <div className="ai-assistant-header">
        <div className="ai-header-left">
          <div className="ai-avatar-badge">
            <Sparkles size={16} color="#FFFFFF" />
          </div>
          <div className="ai-header-titles">
            <span className="ai-header-title">Groq AI Code Assistant</span>
            <div className="ai-header-meta">
              <span 
                className={`ai-model-tag ${isConfigured ? 'is-active' : 'is-pending'}`} 
                title={isConfigured ? `Connected to Groq (${modelName})` : 'Groq API Key pending in backend/.env'}
              >
                {modelName}
              </span>
              <span className="ai-context-pill">
                {language.toUpperCase()} • {codeLineCount} lines
              </span>
            </div>
          </div>
        </div>

        <div className="ai-header-right">
          <button
            type="button"
            className="ai-tool-btn"
            onClick={handleClearConversation}
            title="Clear current session chat history"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="ai-quick-actions-bar">
        <span className="quick-actions-label">Quick Actions:</span>
        <div className="quick-actions-scroll">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className="quick-action-btn"
                onClick={() => handleSendPrompt({ action: action.id })}
                disabled={isLoading}
                title={action.label}
              >
                <Icon size={12} color={action.color} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Messages Stream */}
      <div className="ai-messages-scroll-area">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-message-row ${msg.sender === 'user' ? 'is-user' : 'is-ai'} ${msg.isError ? 'is-error' : ''}`}
          >
            <div className="ai-bubble">
              <div className="ai-bubble-content">
                {renderFormattedText(msg.text)}
              </div>
              <div className="ai-bubble-footer">
                <span className="ai-bubble-time">{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="ai-message-row is-ai">
            <div className="ai-bubble ai-loading-bubble">
              <Loader2 size={15} className="spin-icon" color="#0284C7" />
              <span>Analyzing with Groq AI...</span>
            </div>
          </div>
        )}

        {/* Retry Button if last message failed */}
        {lastFailedPrompt && !isLoading && (
          <div className="ai-retry-row">
            <button
              type="button"
              className="ai-retry-btn"
              onClick={() => handleSendPrompt(lastFailedPrompt)}
            >
              <RotateCcw size={13} />
              <span>Retry Question</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Chat Input Form */}
      <div className="ai-input-wrapper">
        <textarea
          ref={textareaRef}
          className="ai-chat-textarea"
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Groq AI anything... (Press Enter to send, Shift+Enter for newline)"
          disabled={isLoading}
        />
        <button
          type="button"
          className="ai-send-button"
          onClick={() => {
            if (inputText.trim() && !isLoading) {
              handleSendPrompt({ question: inputText.trim() });
            }
          }}
          disabled={isLoading || !inputText.trim()}
          title="Send message"
        >
          {isLoading ? <Loader2 size={15} className="spin-icon" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
};
