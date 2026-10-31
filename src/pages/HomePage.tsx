import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { PlatformOverview } from '../components/PlatformOverview';
import { ProblemOrganization } from '../components/ProblemOrganization';
import { PersonalLearning } from '../components/PersonalLearning';
import { PersonalProgress } from '../components/PersonalProgress';
import { HowItWorks } from '../components/HowItWorks';
import { Features } from '../components/Features';
import { FAQ } from '../components/FAQ';
import { CallToAction } from '../components/CallToAction';
import { Footer } from '../components/Footer';

export function HomePage() {
  const navigate = useNavigate();
  const [isNightMode, setIsNightMode] = useState(true);

  return (
    <div className={`algotrack-app ${isNightMode ? 'night-theme' : 'day-theme'}`}>
      {/* Floating / Sticky Navigation Bar with Theme Toggle */}
      <Navbar 
        isNightMode={isNightMode} 
        onToggleTheme={() => setIsNightMode(!isNightMode)} 
      />

      <main>
        {/* SECTION 1 — HERO */}
        <Hero 
          onStartJourneyClick={() => navigate('/register')} 
          isNightMode={isNightMode} 
        />

        {/* SECTION 2 — INTRODUCTION */}
        <PlatformOverview />

        {/* SECTION 3 — ORGANIZED PRACTICE */}
        <ProblemOrganization />

        {/* SECTION 4 — LEARN YOUR WAY */}
        <PersonalLearning />

        {/* SECTION 5 — PROGRESS TRACKING */}
        <PersonalProgress />

        {/* SECTION 6 — HOW IT WORKS */}
        <HowItWorks />

        {/* SECTION 7 — FEATURES OVERVIEW */}
        <Features />

        {/* SECTION 8 — FAQ */}
        <FAQ />

        {/* SECTION 9 — FINAL CTA */}
        <CallToAction onGetStartedClick={() => navigate('/register')} />
      </main>

      {/* SECTION 10 — FOOTER */}
      <Footer />
    </div>
  );
}

export default HomePage;
