import React from 'react';
import { 
  FolderGit2, 
  Gauge, 
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
  isFeatured?: boolean;
}

export const Features: React.FC = () => {
  const features: FeatureItem[] = [
    {
      id: 1,
      title: 'Curated Problem Collection',
      description: 'Access a common collection of popular coding interview problems in one organized library.',
      icon: <FolderGit2 size={22} className="feat-icon orange" />,
      tag: 'Library',
      isFeatured: true,
    },
    {
      id: 2,
      title: 'Difficulty Organization',
      description: 'Explore problems based on Easy, Medium and Hard difficulty levels.',
      icon: <Gauge size={22} className="feat-icon purple" />,
      tag: 'Tiers',
    },
    {
      id: 3,
      title: 'Topic-Based Learning',
      description: 'Organize your practice around Arrays, Strings, Trees, Graphs, Dynamic Programming and more.',
      icon: <Boxes size={22} className="feat-icon orange" />,
      tag: 'Topics',
    },
    {
      id: 4,
      title: 'Algorithmic Patterns',
      description: 'Recognize reusable approaches such as Two Pointers, Sliding Window, Binary Search, DFS and BFS.',
      icon: <Workflow size={22} className="feat-icon purple" />,
      tag: 'Patterns',
      isFeatured: true,
    },
    {
      id: 5,
      title: 'Personal Notes',
      description: 'Write down your own approach, mistakes, observations and important concepts.',
      icon: <NotebookPen size={22} className="feat-icon orange" />,
      tag: 'Notes',
    },
    {
      id: 6,
      title: 'Solution History',
      description: 'Keep your learning journey organized with saved solutions and personal records.',
      icon: <History size={22} className="feat-icon purple" />,
      tag: 'Records',
    },
    {
      id: 7,
      title: 'Progress Overview',
      description: 'Understand your solved, attempted and remaining problems through clear visual indicators.',
      icon: <PieChart size={22} className="feat-icon orange" />,
      tag: 'Insights',
    },
    {
      id: 8,
      title: 'Revision-Friendly Workspace',
      description: 'Return to previous problems and revisit the methods you learned.',
      icon: <RotateCcw size={22} className="feat-icon purple" />,
      tag: 'Revision',
    },
  ];

  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Core Features</span>
          <h2 className="section-title">Designed Around the Way You Learn</h2>
          <p className="section-description">
            A cohesive set of tools built to help you master patterns, retain critical insights, 
            and practice with disciplined clarity.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat) => (
            <div 
              key={feat.id} 
              className={`feature-card card-saas ${feat.isFeatured ? 'feature-card-featured' : ''}`}
            >
              <div className="feature-card-top">
                <div className="feature-icon-wrapper">
                  {feat.icon}
                </div>
                <span className="feature-tag-badge">{feat.tag}</span>
              </div>

              <div className="feature-card-body">
                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.description}</p>
              </div>

              {feat.isFeatured && feat.id === 1 && (
                <div className="feature-featured-preview">
                  <span className="mini-meta-chip">Blind 75</span>
                  <span className="mini-meta-chip">Grind 169</span>
                  <span className="mini-meta-chip">NeetCode 150</span>
                  <span className="mini-meta-chip accent">+150 Curated</span>
                </div>
              )}

              {feat.isFeatured && feat.id === 4 && (
                <div className="feature-featured-preview">
                  <span className="mini-meta-chip purple">Two Pointers</span>
                  <span className="mini-meta-chip purple">Sliding Window</span>
                  <span className="mini-meta-chip purple">DFS & BFS</span>
                  <span className="mini-meta-chip purple">+12 Patterns</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
