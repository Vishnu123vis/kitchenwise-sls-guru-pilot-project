// Data model types for KitchenWise DynamoDB tables

// Pantry Items Table
export type UserId = string;
export type ItemId = string;

export type PantryItemType =
  | 'Dairy'
  | 'Produce'
  | 'Meat'
  | 'Grains'
  | 'Snacks'
  | 'Beverages'
  | 'Condiments'
  | 'Frozen'
  | 'Other';

export type PantryLocation =
  | 'Fridge'
  | 'Freezer'
  | 'Pantry'
  | 'Counter'
  | 'Other';

export interface PantryItemRecord {
  userId: UserId; // Partition Key
  sortKey: string; // Composite Sort Key: TYPE#LOCATION#ITEMID
  itemId: ItemId; // Original itemId (for backward compatibility)
  title: string; // max 50 chars
  type: PantryItemType;
  location: PantryLocation;
  expiryDate: string; // ISO date string (YYYY-MM-DD)
  count: number; // >= 1
  notes?: string; // max 200 chars
}

// Helper functions for overloaded sort key
export const generateSortKey = (type: PantryItemType, location: PantryLocation, itemId: ItemId): string => {
  return `${type}#${location}#${itemId}`;
};

export const parseSortKey = (sortKey: string): { type: PantryItemType; location: PantryLocation; itemId: ItemId } => {
  const parts = sortKey.split('#');
  if (parts.length !== 3) {
    throw new Error('Invalid sort key format');
  }
  return {
    type: parts[0] as PantryItemType,
    location: parts[1] as PantryLocation,
    itemId: parts[2],
  };
};

export const generateTypeLocationPrefix = (type?: PantryItemType, location?: PantryLocation): string => {
  if (type && location) {
    return `${type}#${location}#`;
  } else if (type) {
    return `${type}#`;
  }
  return '';
};

// Starred Recipes Table
export type RecipeId = string;

export type RecipeStatus = 'temporary' | 'permanent';

export interface StarredRecipeRecord {
  userId: UserId; // Partition Key
  recipeId: RecipeId; // Sort Key
  title: string;
  description: string;
  imageUrl: string;
  constraint: string; // User's constraint when recipe was generated
  status: RecipeStatus; // 'temporary' or 'permanent'
  ttlExpiration?: number; // Unix timestamp for TTL (only for temporary recipes)
}

// Recipe Generation Types
export interface GenerateRecipeRequest {
  constraint?: string;
}

export interface GenerateRecipeResponse {
  recipeId: RecipeId;
  title: string;
  description: string;
  imageUrl: string;
  constraint: string;
}

// Recipe data structure for OpenAI service
export interface RecipeGenerationRequest {
  constraint: string;
  pantryItems: Array<{
    title: string;
    count: number;
  }>;
}

export interface RecipeResponse {
  title: string;
  description: string;
}

// OpenAI API Response Types
export interface OpenAIResponse {
  choices: [{
    message: {
      content: string;
    };
  }];
}

// Pexels API Types
export interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
}
