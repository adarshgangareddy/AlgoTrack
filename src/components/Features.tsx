import React from 'react';
import { 
  FolderGit2, 
  Boxes, 
  Workflow, 
  NotebookPen, 
  History, 
  PieChart, 
  RotateCcw 
} from 'lucide-react';
import './Features.css';

interface FeatureItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
}

export const Features: React.FC = () => {
  const features: FeatureItem[] = [
    {
      id: 1,
      title: 'Curated Problem Library',
      description: 'Access a handpicked collection of high-frequency interview challenges across all essential difficulty levels.',
      icon: <FolderGit2 size={22} className="feat-icon orange" />,
      tag: 'Library',
    },
    {
      id: 2,
      title: 'Topic-Based Learning',
      description: 'Organize your study systematically around fundamental data structures including Arrays, Trees, Graphs, and Dynamic Programming.',
      icon: <Boxes size={22} className="feat-icon purple" />,
      tag: 'Topics',
    },
    {
      id: 3,
      title: 'Algorithmic Patterns',
      description: 'Master reusable solution blueprints like Two Pointers, Sliding Window, and DFS/BFS to solve unseen problems with confidence.',
      icon: <Workflow size={22} className="feat-icon orange" />,
      tag: 'Patterns',
    },
    {
      id: 4,
      title: 'Personal Notes',
      description: 'Document your mental models, step-by-step logic, and specific edge cases to remember for every challenge.',
      icon: <NotebookPen size={22} className="feat-icon purple" />,
      tag: 'Notes',
    },
    {
      id: 5,
      title: 'Solution History',
      description: 'Keep your verified implementations, optimal approaches, and code records stored in one centralized space.',
      icon: <History size={22} className="feat-icon orange" />,
      tag: 'Records',
    },
    {
      id: 6,
      title: 'Progress Tracking',
      description: 'Monitor your completion milestones, consistent coding habits, and algorithmic skill improvement over time.',
      icon: <PieChart size={22} className="feat-icon purple" />,
      tag: 'Progress',
    },
    {
      id: 7,
      title: 'Revision-Friendly Workspace',
      description: 'Quickly revisit previously solved problems and review your saved approaches right before upcoming technical interviews.',
      icon: <RotateCcw size={22} className="feat-icon orange" />,
      tag: 'Revision',
    },
  ];

  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Features Overview</span>
          <h2 className="section-title">Everything You Need to Practice with Purpose.</h2>
          <p className="section-description">
            A cohesive suite of tools designed to help you recognize patterns, retain core insights, and practice with disciplined focus.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat) => (
            <div key={feat.id} className="feature-card card-saas">
              <div className="feature-top">
                <div className="feature-icon-wrapper">
                  {feat.icon}
                </div>
                <span className="feature-pill">{feat.tag}</span>
              </div>

              <div className="feature-body">
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-description">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
