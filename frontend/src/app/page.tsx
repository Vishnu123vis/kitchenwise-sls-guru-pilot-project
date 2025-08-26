"use client";
import { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import AppContainer from '../components/AppContainer';
import styles from './page.module.css';

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);

  // If user wants to see auth, show the authenticator
  if (showAuth) {
    return (
      <Authenticator>
        {({ user }) => (
          <>
            {user ? (
              // User is authenticated - show the main app
              <AppContainer />
            ) : (
              // User is not authenticated - show auth with back button
              <div className={styles.authPage}>
                <button 
                  className={styles.backButton}
                  onClick={() => setShowAuth(false)}
                >
                  ← Back to Landing
                </button>
                <div className={styles.authContainer}>
                  <Authenticator />
                </div>
              </div>
            )}
          </>
        )}
      </Authenticator>
    );
  }

  // Show the simple landing page
  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logo}>🍳</div>
          <h1 className={styles.title}>KitchenWise</h1>
          <p className={styles.subtitle}>
            Your smart kitchen companion
          </p>
          <p className={styles.description}>
            Generate recipes based on your pantry items, manage your kitchen inventory, 
            and discover new dishes with AI-powered suggestions.
          </p>
          <button 
            className={styles.getStartedButton}
            onClick={() => setShowAuth(true)}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🥫</span>
          <h3>Smart Pantry</h3>
          <p>Track ingredients and manage your kitchen inventory</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>👨‍🍳</span>
          <h3>AI Recipes</h3>
          <p>Generate recipes based on available ingredients</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>⭐</span>
          <h3>Save Favorites</h3>
          <p>Star and save your favorite recipes</p>
        </div>
      </div>
    </div>
  );
}
