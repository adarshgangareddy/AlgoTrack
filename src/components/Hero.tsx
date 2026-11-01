import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AlgoTrackBalloon } from './voxel/AlgoTrackBalloon';
import { DevLabRoom } from './voxel/DevLabRoom';
import { ArcadeRoom } from './voxel/ArcadeRoom';
import { DiscoRoom } from './voxel/DiscoRoom';
import { VoxelCrab } from './voxel/VoxelCrab';
import { VoxelChick } from './voxel/VoxelChick';
import { VoxelCoin } from './voxel/VoxelCoin';
import { PuffyCloud } from './voxel/PuffyCloud';
import './Hero.css';

interface HeroProps {
  onStartJourneyClick: () => void;
  isNightMode?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourneyClick, isNightMode = true }) => {
  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" id="hero">
      <div className="container hero-container">
        {/* ====================================================================
            THE "THINGS" MASTER STADIUM CARD WITH FLOATING 3D VOXEL ROOMS
            ==================================================================== */}
        <div className="things-stadium-wrapper">
          {/* Floating Voxel Element 1: Top-Left Red Voxel Crab */}
          <div className="floating-voxel crab-pos" title="Algo mascot crab">
            <VoxelCrab />
          </div>

          {/* Floating Voxel Element 2: Top-Right Dev Lab Room */}
          <div className="floating-voxel dev-lab-pos" title="Dev Lab / Problem Studio">
            <DevLabRoom />
          </div>

          {/* Floating Voxel Element 3: Left Arcade Coding Court Room */}
          <div className="floating-voxel arcade-pos" title="Code Court / Practice Arena">
            <ArcadeRoom />
          </div>

          {/* Floating Voxel Element 4: Right Yellow Voxel Chick */}
          <div className="floating-voxel chick-pos" title="Learning companion chick">
            <VoxelChick />
          </div>

          {/* Floating Voxel Element 5: Bottom-Left Rotating Golden Coin */}
          <div className="floating-voxel coin-pos" title="Golden Algo Token">
            <VoxelCoin />
          </div>

          {/* Floating Voxel Element 6: Bottom-Right Matrix Disco Room */}
          <div className="floating-voxel disco-pos" title="Mastery Club / Server Matrix">
            <DiscoRoom />
          </div>

          {/* THE MAIN SKY / NIGHT SLANTED STADIUM CARD */}
          <div className={`things-main-card ${isNightMode ? 'night-active' : 'day-active'}`}>
            {/* Dynamic Animated Celestial Canvas & Shimmer Atmosphere */}
            <div className="stadium-sky-canvas" aria-hidden="true">
              <div className="celestial-aurora-glow" />
              <div className="celestial-stars-grid" />
            </div>

            {/* Clouds floating inside / across the stage */}
            <PuffyCloud className="cloud-pos-mid-left" tint="white" />
            <PuffyCloud className="cloud-pos-bottom-left" tint="white" />
            <PuffyCloud className="cloud-pos-bottom-right" tint="sunset" />

            {/* Stadium Card Central Typography Content */}
            <div className="stadium-inner-content">
              {/* 1. Main Heading */}
              <h1 className="hero-main-heading">
                Your Coding Journey, Organized.
              </h1>

              {/* 2. 3D AlgoTrack Logo as Centerpiece */}
              <AlgoTrackBalloon />

              {/* 3. Short Description */}
              <p className="hero-description">
                Practice smarter, master DSA, and track your progress — all in one place.
              </p>

              {/* 4. Call to Action Buttons */}
              <div className="stadium-cta-row">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={onStartJourneyClick}
                >
                  <span>Start Your Journey</span>
                  <ArrowRight size={17} />
                </button>

                <a
                  href="#features"
                  className="btn btn-secondary btn-lg"
                  onClick={scrollToFeatures}
                >
                  <span>Explore Features</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
