import React from 'react';
import LogoutButton from '../LogoutButton';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pantry', label: 'Pantry' },
  { id: 'generate-recipe', label: 'Generate Recipe' },
  { id: 'starred-recipes', label: 'Starred Recipes' }
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav style={{ 
      backgroundColor: '#f8f9fa', 
      borderBottom: '1px solid #dee2e6',
      marginBottom: '20px'
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center' 
      }}>
        <div style={{ 
          padding: '0 20px', 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#495057',
          borderRight: '1px solid #dee2e6',
          paddingRight: '30px'
        }}>
          KitchenWise
        </div>
        
        <div style={{ display: 'flex', flex: 1 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '15px 20px',
                backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#495057',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === tab.id ? '3px solid #0056b3' : '3px solid transparent',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ padding: '0 20px' }}>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
