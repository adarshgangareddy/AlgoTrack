import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PlatformOverview } from './components/PlatformOverview';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { ProblemOrganization } from './components/ProblemOrganization';
import { PersonalProgress } from './components/PersonalProgress';
import { PersonalLearning } from './components/PersonalLearning';
import { CallToAction } from './components/CallToAction';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { AuthModalPlaceholder } from './components/AuthModalPlaceholder';

export function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('Get Started');

  const handleAuthAction = (action: string) => {
    setModalAction(action);
    setModalOpen(true);
  };

  return (
    <div className="algotrack-app">
      {/* 1. Floating / Sticky Navigation Bar */}
      <Navbar onAuthPlaceholderClick={handleAuthAction} />

      <main>
        {/* 2. Hero Section with Equa-inspired Product Preview */}
        <Hero onStartJourneyClick={() => handleAuthAction('Get Started')} />

        {/* 3. Platform Overview Section */}
        <PlatformOverview />

        {/* 4. Features Section */}
        <Features />

        {/* 5. How It Works Section */}
        <HowItWorks />

        {/* 6. Problem Organization Section */}
        <ProblemOrganization />

        {/* 7. Personal Progress Tracking Section */}
        <PersonalProgress />

        {/* 8. Learning and Notes Section */}
        <PersonalLearning />

        {/* 9. Call to Action Section */}
        <CallToAction onGetStartedClick={() => handleAuthAction('Get Started')} />

        {/* 10. FAQ Section */}
        <FAQ />
      </main>

      {/* 11. Footer */}
      <Footer />

      {/* Phase 1 Explicit Placeholder Modal */}
      <AuthModalPlaceholder 
        isOpen={modalOpen}
        actionTitle={modalAction}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default App;
