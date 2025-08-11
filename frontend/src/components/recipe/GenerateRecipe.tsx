import React from 'react';

export default function GenerateRecipe() {
  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '0 auto', 
      padding: '20px',
      textAlign: 'center' 
    }}>
      <h2 style={{ marginBottom: '20px', color: '#495057' }}>
        Generate Recipe
      </h2>
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '2px dashed #dee2e6'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#6c757d', marginBottom: '20px' }}>
          🍳 Recipe Generation Coming Soon!
        </div>
        <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
          This feature will allow you to generate recipes based on your pantry items.
          Stay tuned for updates!
        </p>
      </div>
    </div>
  );
}
