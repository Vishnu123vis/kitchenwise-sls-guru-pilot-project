// Dashboard types for frontend

export interface DashboardStats {
  overview: {
    totalItems: number;
    uniqueItems: number;
    averageItemsPerLocation: number;
    mostPopulatedLocation: string;
  };
  locationBreakdown: {
    Fridge: number;
    Freezer: number;
    Pantry: number;
    Counter: number;
    Other: number;
  };
  typeBreakdown: {
    Dairy: number;
    Produce: number;
    Meat: number;
    Grains: number;
    Snacks: number;
    Beverages: number;
    Condiments: number;
    Frozen: number;
    Other: number;
  };
  expiryAlerts: {
    urgent: number;
    warning: number;
    notice: number;
    expired: number;
  };
  inventoryInsights: {
    lowStockItems: number;
    highStockItems: number;
    mostCommonType: string;
  };
}

export interface NavigationTab {
  id: string;
  label: string;
  icon?: string;
  component: React.ComponentType;
}

// Dashboard component props - can be extended in the future
export type DashboardProps = Record<string, never>;
