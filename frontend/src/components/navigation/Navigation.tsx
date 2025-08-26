import React from 'react';
import LogoutButton from '../LogoutButton';
import styles from './Navigation.module.css';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'pantry', label: 'Pantry', icon: '🥫' },
  { id: 'generate-recipe', label: 'Generate Recipe', icon: '👨‍🍳' },
  { id: 'starred-recipes', label: 'Starred Recipes', icon: '⭐' }
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🍳</span>
          KitchenWise
        </div>
        
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className={styles.actions}>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
