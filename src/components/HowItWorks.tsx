import React from 'react';
import { UserPlus, Compass, ExternalLink, CheckCircle } from 'lucide-react';
import './HowItWorks.css';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Start your personal coding preparation journey.',
      icon: <UserPlus size={20} />,
      detail: 'Set your personal target and target interview timeline.',
    },
    {
      number: '02',
      title: 'Choose a Problem',
      description: 'Browse problems by difficulty, topic and algorithmic pattern.',
      icon: <Compass size={20} />,
      detail: 'Filter by patterns like Two Pointers, Trees, or DP.',
    },
    {
      number: '03',
      title: 'Solve and Learn',
      description: 'Open the official LeetCode problem, practice and understand the approach.',
      icon: <ExternalLink size={20} />,
      detail: 'Solve directly on LeetCode with full context in mind.',
    },
    {
      number: '04',
      title: 'Track Your Progress',
      description: 'Record your solution, add personal notes and monitor your improvement.',
      icon: <CheckCircle size={20} />,
      detail: 'Save your complexity analysis, approach, and code.',
    },
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag purple">Structured Workflow</span>
          <h2 className="section-title">A Simple Way to Improve Every Day</h2>
          <p className="section-description">
            A deliberate, four-step routine engineered to eliminate guesswork and build consistent mastery.
          </p>
        </div>

        <div className="steps-container">
          {/* Connecting line (desktop) */}
          <div className="steps-connector-line" aria-hidden="true"></div>

          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.number} className="step-card card-saas">
                <div className="step-header">
                  <div className="step-badge">
                    <span className="step-num">{step.number}</span>
                  </div>
                  <div className="step-icon-box">
                    {step.icon}
                  </div>
                </div>

                <div className="step-body">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>

                <div className="step-footer">
                  <span className="step-detail-text">{step.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
