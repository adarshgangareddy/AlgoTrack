import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(1); // first item open by default

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: 'What is AlgoTrack?',
      answer: 'AlgoTrack is a dedicated coding interview preparation and personal progress-tracking platform. It helps software engineers organize their practice across essential coding problems, categorize challenges by difficulty and algorithmic patterns, take structured learning notes, and monitor consistency over time.'
    },
    {
      id: 2,
      question: 'Who can use AlgoTrack?',
      answer: 'AlgoTrack is designed for computer science students, self-taught developers, and practicing software engineers preparing for technical interviews at startups or top tech companies. Whether you are aiming for your first internship or revising for a senior engineering loop, AlgoTrack keeps your practice structured and deliberate.'
    },
    {
      id: 3,
      question: 'How are problems organized?',
      answer: 'Problems are methodically arranged across three axes: Difficulty (Easy, Medium, Hard), Core Topic (Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, etc.), and Algorithmic Pattern (Two Pointers, Sliding Window, Prefix Sum, Binary Search, DFS/BFS, Backtracking, Greedy, DP).'
    },
    {
      id: 4,
      question: 'Does AlgoTrack replace LeetCode?',
      answer: 'No. AlgoTrack does not replace LeetCode or host custom online judge runners. LeetCode remains the external platform where you solve and submit code against judge test cases. AlgoTrack acts as your personal command center to organize your preparation, curate what to solve next, document mental models, and track your ongoing progress.'
    },
    {
      id: 5,
      question: 'Can I save personal notes and solutions?',
      answer: 'Yes. Each problem includes a personal space where you can document your approach, log time and space complexity, note specific edge cases and traps to watch out for, and store your reference solutions for quick revision.'
    },
    {
      id: 6,
      question: 'Can I track my coding progress?',
      answer: 'Yes. You can track your solved and attempted problems, monitor progress across difficulty tiers and core topics, and maintain a consistent coding habit over time.'
    },
    {
      id: 7,
      question: 'Is AlgoTrack suitable for beginners?',
      answer: 'Yes. If you know the fundamentals of at least one programming language (such as Python, Java, C++, or JavaScript), AlgoTrack’s pattern-first approach is ideal for beginners. By focusing on foundational Easy problems and core patterns first, you build intuition step-by-step before tackling complex Medium and Hard problems.'
    }
  ];

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Got Questions?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-description">
            Everything you need to know about the AlgoTrack platform, its structure, and how it works.
          </p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`faq-item card-saas ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  id={`faq-btn-${faq.id}`}
                >
                  <span className="faq-question-text">{faq.question}</span>
                  <div className={`faq-chevron-box ${isOpen ? 'rotated' : ''}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                <div 
                  id={`faq-answer-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                  className={`faq-answer-collapse ${isOpen ? 'expanded' : ''}`}
                >
                  <div className="faq-answer-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
