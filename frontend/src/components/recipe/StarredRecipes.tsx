"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getStarredRecipes } from '../../api/recipes';
import { StarredRecipe } from '../../types/recipe';
import styles from './StarredRecipes.module.css';

export default function StarredRecipes() {
  const [recipes, setRecipes] = useState<StarredRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'permanent' | 'temporary'>('all');

  useEffect(() => {
    fetchStarredRecipes();
  }, []);

  const fetchStarredRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getStarredRecipes();
      setRecipes(response.items);
      console.log('Starred recipes fetched:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch starred recipes';
      setError(errorMessage);
      console.error('Fetch starred recipes error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredRecipes = () => {
    switch (activeTab) {
      case 'permanent':
        return recipes.filter(recipe => recipe.status === 'permanent');
      case 'temporary':
        return recipes.filter(recipe => recipe.status === 'temporary');
      default:
        return recipes;
    }
  };

  const getTabCount = (type: 'all' | 'permanent' | 'temporary') => {
    switch (type) {
      case 'permanent':
        return recipes.filter(recipe => recipe.status === 'permanent').length;
      case 'temporary':
        return recipes.filter(recipe => recipe.status === 'temporary').length;
      default:
        return recipes.length;
    }
  };

  const formatExpiryDate = (expiryDate: string | null) => {
    if (!expiryDate) return 'No expiry';
    const date = new Date(expiryDate);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        🔄 Loading starred recipes...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.starredRecipes}>
        <div className={styles.error}>
          ❌ {error}
        </div>
        <button
          onClick={fetchStarredRecipes}
          className={styles.retryButton}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className={styles.starredRecipes}>
      <h1 className={styles.title}>⭐ Starred Recipes</h1>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {[
          { key: 'all' as const, label: 'All Recipes' },
          { key: 'permanent' as const, label: 'Permanent' },
          { key: 'temporary' as const, label: 'Temporary' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
          >
            {tab.label} ({getTabCount(tab.key)})
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <div className={styles.emptyState}>
          {activeTab === 'all' 
            ? '📭 No starred recipes yet. Generate some recipes first!' 
            : `📭 No ${activeTab} recipes found.`
          }
        </div>
      ) : (
        <div className={styles.recipeGrid}>
          {filteredRecipes.map((recipe) => (
            <div key={recipe.recipeId} className={styles.recipeCard}>
              {/* Status Badge */}
              <div className={`${styles.statusBadge} ${styles[recipe.status]}`}>
                {recipe.status === 'permanent' ? '★ Permanent' : '⏰ Temporary'}
              </div>

              {/* Recipe Image */}
              {recipe.imageUrl && (
                <div className={styles.recipeImage}>
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    width={400}
                    height={300}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              )}

              {/* Recipe Title */}
              <h3 className={styles.recipeTitle}>
                {recipe.title}
              </h3>

              {/* Recipe Description */}
              <div className={styles.recipeDescription}>
                {recipe.description}
              </div>

              {/* Recipe Details */}
              <div className={styles.recipeDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Constraint:</span>
                  <span className={styles.detailValue}>{recipe.constraint}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={styles.detailValue}>
                    {recipe.status === 'permanent' ? 'Permanent' : 'Temporary'}
                  </span>
                </div>
                {recipe.status === 'temporary' && recipe.expiresAt && (
                  <div className={styles.expiryWarning}>
                    <span className={styles.detailLabel}>Expires:</span>
                    <span className={styles.detailValue}>
                      {formatExpiryDate(recipe.expiresAt)}
                      {recipe.daysUntilExpiry !== undefined && (
                        <span> ({recipe.daysUntilExpiry} days left)</span>
                      )}
                    </span>
                  </div>
                )}
                <div className={styles.recipeId}>
                  ID: {recipe.recipeId}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className={styles.refreshSection}>
        <button
          onClick={fetchStarredRecipes}
          className={styles.refreshButton}
        >
          🔄 Refresh Recipes
        </button>
      </div>
    </div>
  );
}
