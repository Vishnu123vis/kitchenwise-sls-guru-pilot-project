// Centralized input validation for pantry CRUD Lambdas

export function validateCreatePantryItem(input: any) {
  const errors: string[] = [];
  if (!input) {
    errors.push('No input provided');
    return errors;
  }
  if (typeof input.title !== 'string' || input.title.trim() === '') {
    errors.push('Title is required and must be a non-empty string');
  }
  if (typeof input.count !== 'number' || input.count < 1) {
    errors.push('Count must be a positive number');
  }
  if (typeof input.expiryDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.expiryDate)) {
    errors.push('Expiry date must be a string in YYYY-MM-DD format');
  }
    if (!input.type || !['Dairy','Produce','Meat','Grains','Snacks','Beverages','Condiments','Frozen','Other'].includes(input.type)) {
    errors.push('Invalid type');
  }
  if (!input.location || !['Fridge','Freezer','Pantry','Counter','Other'].includes(input.location)) {
    errors.push('Invalid location');
  }
  if (input.notes && (typeof input.notes !== 'string' || input.notes.length > 200)) {
    errors.push('Invalid notes');
  }
  return errors;
}

export function validateDeletePantryItem(input: any) {
  const errors: string[] = [];
  if (!input || !input.itemId || typeof input.itemId !== 'string' || input.itemId.trim() === '') {
    errors.push('Item ID is required');
  }
  if (!input || !input.userId || typeof input.userId !== 'string' || input.userId.trim() === '') {
    errors.push('User ID is required');
  }
  return errors;
}

export function validateUpdatePantryItem(input: any) {
  const errors: string[] = [];
  if (!input) {
    errors.push('No input provided');
    return errors;
  }
  if (input.title && (typeof input.title !== 'string' || input.title.length > 50)) {
    errors.push('Invalid title');
  }
  if (input.type && !['Dairy','Produce','Meat','Grains','Snacks','Beverages','Condiments','Frozen','Other'].includes(input.type)) {
    errors.push('Invalid type');
  }
  if (input.location && !['Fridge','Freezer','Pantry','Counter','Other'].includes(input.location)) {
    errors.push('Invalid location');
  }
  if (input.expiryDate && typeof input.expiryDate !== 'string') {
    errors.push('Invalid expiryDate');
  }
  if (input.count && (typeof input.count !== 'number' || input.count < 1)) {
    errors.push('Invalid count');
  }
  if (input.notes && (typeof input.notes !== 'string' || input.notes.length > 200)) {
    errors.push('Invalid notes');
  }
  return errors;
}

export function validateGetPantryItem(input: any) {
  const errors: string[] = [];
  if (!input || !input.itemId || typeof input.itemId !== 'string' || input.itemId.trim() === '') {
    errors.push('Item ID is required');
  }
  if (!input || !input.userId || typeof input.userId !== 'string' || input.userId.trim() === '') {
    errors.push('User ID is required');
  }
  return errors;
}

export function validateGenerateRecipe(input: any) {
  const errors: string[] = [];
  
  if (!input) {
    errors.push('No input provided');
    return errors;
  }

  // Validate constraint
  const validConstraints = [
    'No Constraint',
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'High Protein',
    'Low Carb'
  ];

  if (input.constraint && !validConstraints.includes(input.constraint)) {
    errors.push(`Invalid constraint. Must be one of: ${validConstraints.join(', ')}`);
  }

  return errors;
}

export function validateStarRecipe(input: any) {
  const errors: string[] = [];
  
  if (!input) {
    errors.push('No input provided');
    return errors;
  }

  if (!input.recipeId || typeof input.recipeId !== 'string' || input.recipeId.trim() === '') {
    errors.push('Recipe ID is required');
  }

  if (!input.action || !['star', 'unstar'].includes(input.action)) {
    errors.push('Action must be either "star" or "unstar"');
  }

  return errors;
}

export function validateGetStarredRecipes(input: any) {
  const errors: string[] = [];
  
  if (!input) {
    return errors; // No input is valid for this function
  }

  if (input.limit && (typeof input.limit !== 'number' || input.limit < 1)) {
    errors.push('Limit must be a positive number');
  }

  if (input.lastEvaluatedKey && typeof input.lastEvaluatedKey !== 'string') {
    errors.push('Last evaluated key must be a string');
  }

  return errors;
}

export function validateGetStarredRecipe(input: any) {
  const errors: string[] = [];
  
  if (!input) {
    errors.push('No input provided');
    return errors;
  }

  if (!input.recipeId || typeof input.recipeId !== 'string' || input.recipeId.trim() === '') {
    errors.push('Recipe ID is required');
  }

  return errors;
}
