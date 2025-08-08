// Pantry item types for frontend

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

export interface PantryItem {
  userId: string;
  itemId: string;
  title: string;
  type: PantryItemType;
  location: PantryLocation;
  expiryDate: string;
  count: number;
  notes?: string;
}
