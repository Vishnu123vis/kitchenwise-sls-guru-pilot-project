import {
  validateCreatePantryItem,
  validateDeletePantryItem,
  validateUpdatePantryItem,
  validateGetPantryItem,
  validateGenerateRecipe
} from '../../../src/libs/inputValidation';

describe('Input Validation Tests', () => {
  describe('validateCreatePantryItem', () => {
    const validInput = {
      title: 'Milk',
      count: 2,
      expiryDate: '2024-12-31',
      type: 'Dairy',
      location: 'Fridge',
      notes: 'Organic whole milk'
    };

    it('should pass validation with valid input', () => {
      const errors = validateCreatePantryItem(validInput);
      expect(errors).toEqual([]);
    });

    it('should fail validation with no input', () => {
      const errors = validateCreatePantryItem(null);
      expect(errors).toContain('No input provided');
    });

    it('should fail validation with missing title', () => {
      const input = { ...validInput, title: '' };
      const errors = validateCreatePantryItem(input);
      expect(errors).toContain('Title is required and must be a non-empty string');
    });

    it('should fail validation with invalid title type', () => {
      const input = { ...validInput, title: 123 };
      const errors = validateCreatePantryItem(input);
      expect(errors).toContain('Title is required and must be a non-empty string');
    });

    it('should fail validation with invalid count', () => {
      const input = { ...validInput, count: 0 };
      const errors = validateCreatePantryItem(input);
      expect(errors).toContain('Count must be a positive number');
    });

    it('should fail validation with negative count', () => {
      const input = { ...validInput, count: -1 };
      const errors = validateCreatePantryItem(input);
      expect(errors).toContain('Count must be a positive number');
    });

    it('should fail validation with invalid expiry date format', () => {
      const input = { ...validInput, expiryDate: '31-12-2024' };
      const errors = validateCreatePantryItem(input);
      expect(errors).toContain('Expiry date must be a string in YYYY-MM-DD format');
    });

    it('should fail validation with invalid type', () => {
      const input = { ...validInput, type: 'InvalidType' };
      const errors = validateCreatePantryItem(input);
      expect(errors).toContain('Invalid type');
    });

    it('should fail validation with invalid location', () => {
      const input = { ...validInput, location: 'InvalidLocation' };
      const errors = validateCreatePantryItem(input);
      expect(errors).toContain('Invalid location');
    });

    it('should fail validation with notes too long', () => {
      const input = { ...validInput, notes: 'a'.repeat(201) };
      const errors = validateCreatePantryItem(input);
      expect(errors).toContain('Invalid notes');
    });

    it('should pass validation with valid type values', () => {
      const validTypes = ['Dairy', 'Produce', 'Meat', 'Grains', 'Snacks', 'Beverages', 'Condiments', 'Frozen', 'Other'];
      validTypes.forEach(type => {
        const input = { ...validInput, type };
        const errors = validateCreatePantryItem(input);
        expect(errors).toEqual([]);
      });
    });

    it('should pass validation with valid location values', () => {
      const validLocations = ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Other'];
      validLocations.forEach(location => {
        const input = { ...validInput, location };
        const errors = validateCreatePantryItem(input);
        expect(errors).toEqual([]);
      });
    });
  });

  describe('validateDeletePantryItem', () => {
    const validInput = {
      itemId: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user123'
    };

    it('should pass validation with valid input', () => {
      const errors = validateDeletePantryItem(validInput);
      expect(errors).toEqual([]);
    });

    it('should fail validation with no input', () => {
      const errors = validateDeletePantryItem(null);
      expect(errors).toContain('Item ID is required');
      expect(errors).toContain('User ID is required');
    });

    it('should fail validation with missing itemId', () => {
      const input = { userId: 'user123' };
      const errors = validateDeletePantryItem(input);
      expect(errors).toContain('Item ID is required');
    });

    it('should fail validation with empty itemId', () => {
      const input = { ...validInput, itemId: '' };
      const errors = validateDeletePantryItem(input);
      expect(errors).toContain('Item ID is required');
    });

    it('should fail validation with missing userId', () => {
      const input = { itemId: '123e4567-e89b-12d3-a456-426614174000' };
      const errors = validateDeletePantryItem(input);
      expect(errors).toContain('User ID is required');
    });

    it('should fail validation with empty userId', () => {
      const input = { ...validInput, userId: '' };
      const errors = validateDeletePantryItem(input);
      expect(errors).toContain('User ID is required');
    });
  });

  describe('validateUpdatePantryItem', () => {
    const validInput = {
      title: 'Updated Milk',
      type: 'Dairy',
      location: 'Fridge',
      count: 3,
      notes: 'Updated notes'
    };

    it('should pass validation with valid input', () => {
      const errors = validateUpdatePantryItem(validInput);
      expect(errors).toEqual([]);
    });

    it('should fail validation with no input', () => {
      const errors = validateUpdatePantryItem(null);
      expect(errors).toContain('No input provided');
    });

    it('should fail validation with title too long', () => {
      const input = { title: 'a'.repeat(51) };
      const errors = validateUpdatePantryItem(input);
      expect(errors).toContain('Invalid title');
    });

    it('should fail validation with invalid type', () => {
      const input = { type: 'InvalidType' };
      const errors = validateUpdatePantryItem(input);
      expect(errors).toContain('Invalid type');
    });

    it('should fail validation with invalid location', () => {
      const input = { location: 'InvalidLocation' };
      const errors = validateUpdatePantryItem(input);
      expect(errors).toContain('Invalid location');
    });

    it('should fail validation with invalid count', () => {
      const input = { count: -1 };
      const errors = validateUpdatePantryItem(input);
      expect(errors).toContain('Invalid count');
    });

    it('should fail validation with notes too long', () => {
      const input = { notes: 'a'.repeat(201) };
      const errors = validateUpdatePantryItem(input);
      expect(errors).toContain('Invalid notes');
    });

    it('should pass validation with partial updates', () => {
      const partialInputs = [
        { title: 'New Title' },
        { type: 'Produce' },
        { location: 'Pantry' },
        { count: 5 },
        { notes: 'Short notes' }
      ];

      partialInputs.forEach(input => {
        const errors = validateUpdatePantryItem(input);
        expect(errors).toEqual([]);
      });
    });
  });

  describe('validateGetPantryItem', () => {
    const validInput = {
      itemId: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user123'
    };

    it('should pass validation with valid input', () => {
      const errors = validateGetPantryItem(validInput);
      expect(errors).toEqual([]);
    });

    it('should fail validation with no input', () => {
      const errors = validateGetPantryItem(null);
      expect(errors).toContain('Item ID is required');
      expect(errors).toContain('User ID is required');
    });

    it('should fail validation with missing itemId', () => {
      const input = { userId: 'user123' };
      const errors = validateGetPantryItem(input);
      expect(errors).toContain('Item ID is required');
    });

    it('should fail validation with missing userId', () => {
      const input = { itemId: '123e4567-e89b-12d3-a456-426614174000' };
      const errors = validateGetPantryItem(input);
      expect(errors).toContain('User ID is required');
    });
  });

  describe('validateGenerateRecipe', () => {
    const validInput = {
      constraint: 'Vegetarian'
    };

    it('should pass validation with valid constraint', () => {
      const errors = validateGenerateRecipe(validInput);
      expect(errors).toEqual([]);
    });

    it('should pass validation with no constraint', () => {
      const input = {};
      const errors = validateGenerateRecipe(input);
      expect(errors).toEqual([]);
    });

    it('should pass validation with null constraint', () => {
      const input = { constraint: null };
      const errors = validateGenerateRecipe(input);
      expect(errors).toEqual([]);
    });

    it('should fail validation with no input', () => {
      const errors = validateGenerateRecipe(null);
      expect(errors).toContain('No input provided');
    });

    it('should fail validation with invalid constraint', () => {
      const input = { constraint: 'InvalidConstraint' };
      const errors = validateGenerateRecipe(input);
      expect(errors).toContain('Invalid constraint. Must be one of: No Constraint, Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, High Protein, Low Carb');
    });

    it('should pass validation with all valid constraints', () => {
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

      validConstraints.forEach(constraint => {
        const input = { constraint };
        const errors = validateGenerateRecipe(input);
        expect(errors).toEqual([]);
      });
    });
  });
});
