// Recipe types for KitchenWise frontend

export interface GenerateRecipeRequest {
  constraint?: string;
}

export interface GenerateRecipeResponse {
  recipeId: string;
  title: string;
  description: string;
  imageUrl: string;
  constraint: string;
}

export interface StarredRecipe {
  userId: string;
  recipeId: string;
  title: string;
  description: string;
  imageUrl: string;
  constraint: string;
  status: 'temporary' | 'permanent';
  ttlExpiration?: number;
  isTemporary: boolean;
  expiresAt?: string;
  daysUntilExpiry?: number;
}

export interface StarredRecipesResponse {
  items: StarredRecipe[];
  temporaryRecipes: StarredRecipe[];
  permanentRecipes: StarredRecipe[];
  lastEvaluatedKey?: Record<string, unknown>;
  totalCount: number;
  temporaryCount: number;
  permanentCount: number;
  hasMore: boolean;
}

export interface StarRecipeRequest {
  recipeId: string;
  title: string;
  description: string;
  imageUrl: string;
  constraint: string;
}

// Common constraint options for the dropdown
export const RECIPE_CONSTRAINTS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Quick & Easy',
  'Budget-Friendly',
  'High Protein',
  'Low Carb',
  'Kid-Friendly',
  'Healthy',
  'Comfort Food',
  'International Cuisine',
  'Seasonal',
  'No Constraint'
] as const;

export type RecipeConstraint = typeof RECIPE_CONSTRAINTS[number];
