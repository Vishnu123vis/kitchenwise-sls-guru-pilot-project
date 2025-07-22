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
  if (!input || typeof input.itemId !== 'string' || input.itemId.trim() === '') {
    errors.push('itemId is required and must be a non-empty string');
  }
  if (!input || typeof input.userId !== 'string' || input.userId.trim() === '') {
    errors.push('userId is required and must be a non-empty string');
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
  if (!input || typeof input.itemId !== 'string' || input.itemId.trim() === '') {
    errors.push('itemId is required and must be a non-empty string');
  }
  if (!input || typeof input.userId !== 'string' || input.userId.trim() === '') {
    errors.push('userId is required and must be a non-empty string');
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
