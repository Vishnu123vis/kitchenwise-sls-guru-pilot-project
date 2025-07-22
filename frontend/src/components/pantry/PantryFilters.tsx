import { PantryItemType, PantryLocation } from '../../types/pantry';

const typeOptions: PantryItemType[] = [
  'Dairy', 'Produce', 'Meat', 'Grains', 'Snacks', 'Beverages', 'Condiments', 'Frozen', 'Other'
];

const locationOptions: PantryLocation[] = [
  'Fridge', 'Freezer', 'Pantry', 'Counter', 'Other'
];

interface PantryFiltersProps {
  filters: { type?: PantryItemType; location?: PantryLocation };
  onApplyFilters: (filters: { type?: PantryItemType; location?: PantryLocation }) => void;
  onClearFilters: () => void;
}

export default function PantryFilters({ filters, onApplyFilters, onClearFilters }: PantryFiltersProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as PantryItemType || undefined;
    onApplyFilters({ ...filters, type: newType });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value as PantryLocation || undefined;
    onApplyFilters({ ...filters, location: newLocation });
  };

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Filter Items</h3>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Item Type
          </label>
          <select
            id="type-filter"
            value={filters.type || ''}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            id="location-filter"
            value={filters.location || ''}
            onChange={handleLocationChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Locations</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {(filters.type || filters.location) && (
        <div className="mt-3 text-sm text-gray-600">
          Active filters: 
          {filters.type && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">Type: {filters.type}</span>}
          {filters.location && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded">Location: {filters.location}</span>}
        </div>
      )}
    </div>
  );
} 