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
            children
          ) : (
            <div className={styles.pageContainer}>
              {/* Landing Page Section - Full Width */}
              <div className={styles.landingSection}>
                <div className={styles.landingContent}>
                  <div className={styles.hero}>
                    <div className={styles.logo}>🍳</div>
                    <h1 className={styles.title}>Welcome to KitchenWise</h1>
                    <p className={styles.subtitle}>
                      Your smart kitchen companion for recipe generation and pantry management
                    </p>
                  </div>
                  
                  <div className={styles.features}>
                    <div className={styles.feature}>
                      <span className={styles.featureIcon}>🥫</span>
                      <h3>Smart Pantry</h3>
                      <p>Track ingredients and manage your kitchen inventory</p>
                    </div>
                    <div className={styles.feature}>
                      <span className={styles.featureIcon}>👨‍🍳</span>
                      <h3>AI Recipes</h3>
                      <p>Generate recipes based on your available ingredients</p>
                    </div>
                    <div className={styles.feature}>
                      <span className={styles.featureIcon}>⭐</span>
                      <h3>Save Favorites</h3>
                      <p>Star and save your favorite recipes</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Authentication Section - Centered Below Landing Page */}
              <div className={styles.authSection}>
                <div className={styles.authWrapper}>
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
