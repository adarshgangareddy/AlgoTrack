import React, { useState } from 'react';
import { 
  BookOpen, 
  Code2, 
  Clock, 
  Database, 
  AlertTriangle, 
  RotateCcw, 
  Check, 
  Sparkles,
  FileCode2,
  Bookmark
} from 'lucide-react';
import './PersonalLearning.css';

export const PersonalLearning: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'python' | 'ts' | 'java' | 'cpp'>('python');

  const codeSnippets = {
    python: `def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    max_len = left = 0
    
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
        
    return max_len`,
    ts: `function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>();
  let maxLen = 0, left = 0;
  
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char)! >= left) {
      left = map.get(char)! + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
    java: `public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> map = new HashMap<>();
    int maxLen = 0, left = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (map.containsKey(c) && map.get(c) >= left) {
            left = map.get(c) + 1;
        }
        map.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    cpp: `int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> map;
    int maxLen = 0, left = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char c = s[right];
        if (map.count(c) && map[c] >= left) {
            left = map[c] + 1;
        }
        map[c] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`
  };

  const learningPillars = [
    {
      title: 'Pre-Problem Reading',
      desc: 'Review fundamental pattern concepts before jumping directly into problem solving.',
      icon: <BookOpen size={18} className="text-orange" />
    },
    {
      title: 'Structured Approach Log',
      desc: 'Formulate and articulate your step-by-step logic before writing code.',
      icon: <FileCode2 size={18} className="text-purple" />
    },
    {
      title: 'Time & Space Complexity',
      desc: 'Document asymptotic bounds to build intuition for interview-ready justifications.',
      icon: <Clock size={18} className="text-orange" />
    },
    {
      title: 'Mistake & Edge-Case Archive',
      desc: 'Flag exact traps: off-by-one errors, empty sets, negative inputs, and duplicates.',
      icon: <AlertTriangle size={18} className="text-purple" />
    },
    {
      title: 'Multi-Language Solutions',
      desc: 'Keep clean, verified reference solutions in your preferred interview language.',
      icon: <Code2 size={18} className="text-orange" />
    },
    {
      title: 'Spaced Revision Triggers',
      desc: 'Revisit difficult patterns automatically before critical technical rounds.',
      icon: <RotateCcw size={18} className="text-purple" />
    },
  ];

  return (
    <section className="learning-section" id="learning">
      <div className="container">
        <div className="section-header">
          <span className="section-tag purple">Deep Understanding</span>
          <h2 className="section-title">Don't Just Solve Problems. Understand Them.</h2>
          <p className="section-description">
            Memorizing solutions leads to blanking during interviews. AlgoTrack gives you a personal 
            workspace to document approaches, analyze complexity, and archive crucial mistakes.
          </p>
        </div>

        {/* 6 Capabilities Cards Grid */}
        <div className="pillars-grid">
          {learningPillars.map((p) => (
            <div key={p.title} className="pillar-card card-saas">
              <div className="pillar-header">
                <div className="pillar-icon-box">
                  {p.icon}
                </div>
                <h3 className="pillar-title">{p.title}</h3>
              </div>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Visual Workspace Preview Mockup */}
        <div className="workspace-preview-card card-saas">
          <div className="workspace-preview-topbar">
            <div className="workspace-problem-meta">
              <span className="meta-tag diff-med">Medium</span>
              <span className="meta-id">Problem #3</span>
              <span className="meta-name">Longest Substring Without Repeating Characters</span>
            </div>
            <div className="workspace-preview-badge">
              <Sparkles size={12} className="text-orange" />
              <span>Future Learning Workspace Preview</span>
            </div>
          </div>

          <div className="workspace-preview-split">
            {/* Left: Notes, Complexity, Traps */}
            <div className="workspace-notes-panel">
              <div className="notes-block">
                <div className="block-label">Your Approach & Mental Model</div>
                <div className="approach-text-box">
                  Use the <strong>Sliding Window</strong> pattern with a dynamic right pointer. Store 
                  the most recent 0-indexed position of each seen character in a Hash Map. 
                  When encountering a duplicate, move the <code>left</code> pointer past the previous occurrence.
                </div>
              </div>

              <div className="complexity-grid">
                <div className="complexity-item">
                  <div className="complexity-label">Time Complexity</div>
                  <div className="complexity-val">O(N)</div>
                  <div className="complexity-sub">Each char visited at most twice</div>
                </div>
                <div className="complexity-item">
                  <div className="complexity-label">Space Complexity</div>
                  <div className="complexity-val">O(min(N, M))</div>
                  <div className="complexity-sub">Bounded by alphabet character set size</div>
                </div>
              </div>

              <div className="traps-box">
                <div className="traps-header">
                  <AlertTriangle size={14} className="text-danger" />
                  <span className="traps-title">Key Mistake to Avoid</span>
                </div>
                <div className="traps-text">
                  Make sure <code>map.get(char) &gt;= left</code> before updating <code>left</code>. 
                  Otherwise, an older duplicate from outside the current window could pull 
                  <code>left</code> backwards!
                </div>
              </div>

              <div className="revision-pill-row">
                <span className="revision-pill">
                  <RotateCcw size={12} />
                  <span>Scheduled Revision: In 5 Days</span>
                </span>
                <span className="confidence-pill">High Confidence</span>
              </div>
            </div>

            {/* Right: Code Solution Viewer */}
            <div className="workspace-code-panel">
              <div className="code-panel-header">
                <div className="code-lang-tabs">
                  <button 
                    type="button" 
                    className={`lang-tab ${activeLang === 'python' ? 'active' : ''}`}
                    onClick={() => setActiveLang('python')}
                  >
                    Python 3
                  </button>
                  <button 
                    type="button" 
                    className={`lang-tab ${activeLang === 'ts' ? 'active' : ''}`}
                    onClick={() => setActiveLang('ts')}
                  >
                    TypeScript
                  </button>
                  <button 
                    type="button" 
                    className={`lang-tab ${activeLang === 'java' ? 'active' : ''}`}
                    onClick={() => setActiveLang('java')}
                  >
                    Java
                  </button>
                  <button 
                    type="button" 
                    className={`lang-tab ${activeLang === 'cpp' ? 'active' : ''}`}
                    onClick={() => setActiveLang('cpp')}
                  >
                    C++
                  </button>
                </div>
                <span className="code-status-pill">
                  <Check size={12} /> Verified Solution
                </span>
              </div>

              <div className="code-editor-area">
                <pre className="code-pre">
                  <code>{codeSnippets[activeLang]}</code>
                </pre>
              </div>

              <div className="code-panel-footer">
                <span className="footer-filename">solution.{activeLang === 'python' ? 'py' : activeLang === 'ts' ? 'ts' : activeLang === 'java' ? 'java' : 'cpp'}</span>
                <span className="footer-sync-note">Personal saved solution • Editable in Phase 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
