import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { PlatformOverview } from '../components/PlatformOverview';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { ProblemOrganization } from '../components/ProblemOrganization';
import { PersonalProgress } from '../components/PersonalProgress';
import { PersonalLearning } from '../components/PersonalLearning';
import { CallToAction } from '../components/CallToAction';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';

export function HomePage() {
  const navigate = useNavigate();
  const [isNightMode, setIsNightMode] = useState(true);

  return (
    <div className={`algotrack-app ${isNightMode ? 'night-theme' : 'day-theme'}`}>
      {/* 1. Floating / Sticky Navigation Bar with Theme Toggle */}
      <Navbar 
        isNightMode={isNightMode} 
        onToggleTheme={() => setIsNightMode(!isNightMode)} 
      />

      <main>
        {/* 2. Hero Section with Equa-inspired 3D Voxel Elements & Product Preview */}
        <Hero 
          onStartJourneyClick={() => navigate('/register')} 
          isNightMode={isNightMode} 
        />

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
        <CallToAction onGetStartedClick={() => navigate('/register')} />

        {/* 10. FAQ Section */}
        <FAQ />
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;
