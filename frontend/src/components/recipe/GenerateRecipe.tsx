"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { generateRecipe, starRecipe } from '../../api/recipes';
import { RECIPE_CONSTRAINTS, GenerateRecipeResponse, StarRecipeRequest } from '../../types/recipe';
import styles from './GenerateRecipe.module.css';

export default function GenerateRecipe() {
  const [selectedConstraint, setSelectedConstraint] = useState<string>('No Constraint');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<GenerateRecipeResponse | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentRecipe(null);
    setIsStarred(false);

    try {
      const constraint = selectedConstraint === 'No Constraint' ? undefined : selectedConstraint;
      const recipe = await generateRecipe({ constraint });
      setCurrentRecipe(recipe);
      console.log('Recipe generated:', recipe);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recipe';
      setError(errorMessage);
      console.error('Recipe generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStarRecipe = async () => {
    console.log('=== HANDLE STAR RECIPE DEBUG START ===');
    console.log('1. handleStarRecipe function called');
    
    if (!currentRecipe) {
      console.log('2. No current recipe, returning early');
      return;
    }

    console.log('3. Current recipe exists:', currentRecipe);
    
    try {
      console.log('4. Creating star request...');
      const starRequest: StarRecipeRequest = {
        recipeId: currentRecipe.recipeId,
        title: currentRecipe.title,
        description: currentRecipe.description,
        imageUrl: currentRecipe.imageUrl,
        constraint: currentRecipe.constraint
      };
      
      console.log('5. Star request created:', JSON.stringify(starRequest, null, 2));
      console.log('6. Calling starRecipe API function...');
      
      await starRecipe(starRequest);
      
      console.log('7. starRecipe API call completed successfully');
      setIsStarred(true);
      console.log('8. Recipe starred successfully');
    } catch (err) {
      console.log('=== HANDLE STAR RECIPE ERROR ===');
      console.log('Error in handleStarRecipe:', err);
      console.log('Error type:', typeof err);
      console.log('Error constructor:', err?.constructor?.name);
      console.log('Error message:', err instanceof Error ? err.message : 'No message');
      console.log('Error stack:', err instanceof Error ? err.stack : 'No stack');
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to star recipe';
      setError(errorMessage);
      console.error('Star recipe error:', err);
    }
    
    console.log('=== HANDLE STAR RECIPE DEBUG END ===');
  };

  const handleGenerateNew = () => {
    setCurrentRecipe(null);
    setIsStarred(false);
    setError(null);
  };

  return (
    <div className={styles.generateRecipe}>
      <h1 className={styles.title}>👨‍🍳 Generate Recipe</h1>

      {/* Constraint Selection */}
      <div className={styles.constraintSection}>
        <label className={styles.constraintLabel}>
          Recipe Constraint:
        </label>
        <select
          value={selectedConstraint}
          onChange={(e) => setSelectedConstraint(e.target.value)}
          className={styles.constraintSelect}
        >
          {RECIPE_CONSTRAINTS.map((constraint) => (
            <option key={constraint} value={constraint}>
              {constraint}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateRecipe}
        disabled={isGenerating}
        className={styles.generateButton}
      >
        {isGenerating ? '🔄 Generating...' : '🎲 Generate Recipe'}
      </button>

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          ❌ {error}
        </div>
      )}

      {/* Recipe Display */}
      {currentRecipe && (
        <div className={styles.recipeCard}>
          {/* Star Button */}
          <button
            onClick={handleStarRecipe}
            disabled={isStarred}
            className={`${styles.starButton} ${isStarred ? styles.starred : ''}`}
            title={isStarred ? 'Recipe starred!' : 'Click to star this recipe'}
          >
            {isStarred ? '★' : '☆'}
          </button>

          {/* Recipe Image */}
          {currentRecipe.imageUrl && (
            <div className={styles.recipeImage}>
              <Image
                src={currentRecipe.imageUrl}
                alt={currentRecipe.title}
                width={400}
                height={300}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}

          {/* Recipe Title */}
          <h2 className={styles.recipeTitle}>
            {currentRecipe.title}
          </h2>

          {/* Recipe Description */}
          <div className={styles.recipeDescription}>
            {currentRecipe.description}
          </div>

          {/* Recipe Details */}
          <div className={styles.recipeDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Constraint</span>
              <span className={styles.detailValue}>{currentRecipe.constraint}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Recipe ID</span>
              <span className={styles.detailValue}>{currentRecipe.recipeId}</span>
            </div>
          </div>

          {/* Generate New Button */}
          <div className={styles.generateNewSection}>
            <button
              onClick={handleGenerateNew}
              className={styles.generateNewButton}
            >
              🎲 Generate New Recipe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
