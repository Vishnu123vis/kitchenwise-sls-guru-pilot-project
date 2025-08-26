"use client";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import styles from './AuthLanding.module.css';

export default function AuthLanding({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator>
      {({ user }) => (
        <>
          {user ? (
            // User is authenticated - show the main app
            children
          ) : (
            // User is not authenticated - show the landing page
            <div className={styles.pageContainer}>
              {/* Hero Section */}
              <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                  <div className={styles.logo}>🍳</div>
                  <h1 className={styles.title}>Welcome to KitchenWise</h1>
                  <p className={styles.subtitle}>
                    Your smart kitchen companion for recipe generation and pantry management
                  </p>
                  <p className={styles.description}>
                    Generate delicious recipes based on your available ingredients, 
                    manage your kitchen inventory, and discover new dishes with AI-powered suggestions.
                  </p>
                </div>
              </div>

              {/* Features Section */}
              <div className={styles.featuresSection}>
                <div className={styles.featuresGrid}>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>🥫</span>
                    <h3>Smart Pantry</h3>
                    <p>Track ingredients and manage your kitchen inventory efficiently</p>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>👨‍🍳</span>
                    <h3>AI Recipe Generation</h3>
                    <p>Get personalized recipes based on what you have in your kitchen</p>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>⭐</span>
                    <h3>Save Favorites</h3>
                    <p>Star and save your favorite recipes for quick access</p>
                  </div>
                </div>
              </div>

              {/* Get Started Section */}
              <div className={styles.getStartedSection}>
                <h2>Ready to get started?</h2>
                <p>Sign in or create an account to start managing your kitchen</p>
                <div className={styles.authContainer}>
                  <Authenticator />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Authenticator>
  );
}
