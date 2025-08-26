import React, { useState } from 'react';
import Navigation from './navigation/Navigation';
import Dashboard from './dashboard/Dashboard';
import PantryManagement from './pantry/PantryManagement';
import GenerateRecipe from './recipe/GenerateRecipe';
import StarredRecipes from './recipe/StarredRecipes';

export default function AppContainer() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pantry':
        return <PantryManagement />;
      case 'generate-recipe':
        return <GenerateRecipe />;
      case 'starred-recipes':
        return <StarredRecipes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{ paddingTop: 'var(--spacing-md)' }}>
        {renderActiveComponent()}
      </main>
    </div>
  );
}
