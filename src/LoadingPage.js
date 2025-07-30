import React, { useState, useEffect } from 'react';
import './LoadingPage.css';

const LoadingPage = ({ user, onLoadingComplete }) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showMain, setShowMain] = useState(false);

  useEffect(() => {
    // Show welcome message for 2 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      setShowTransition(true);
    }, 2000);

    // Show transition image for 1 second
    const transitionTimer = setTimeout(() => {
      setShowTransition(false);
      setShowMain(true);
      onLoadingComplete();
    }, 3000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(transitionTimer);
    };
  }, [onLoadingComplete]);

  if (showMain) {
    return null; // Let the parent component handle the main page
  }

  return (
    <div className="loading-page">
      {showWelcome && (
        <div className="welcome-container">
          <div className="welcome-content">
            <h1 className="welcome-title">
              {user?.isFirstLogin ? (
                <>
                  Welcome to cherry-pick, <span className="user-name">{user?.firstName || 'User'}</span>
                </>
              ) : (
                <>
                  Welcome back, <span className="user-name">{user?.firstName || 'User'}</span>
                </>
              )}
            </h1>
            <div className="loading-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      )}
      
      {showTransition && (
        <div className="transition-container">
          <img 
            src="/images/transition.png" 
            alt="Loading transition" 
            className="transition-image"
            onError={(e) => {
              console.log('Transition image failed to load, continuing to main page');
              setShowTransition(false);
              setShowMain(true);
              onLoadingComplete();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LoadingPage; 