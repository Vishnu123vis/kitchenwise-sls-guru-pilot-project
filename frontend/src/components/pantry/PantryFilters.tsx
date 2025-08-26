import { PantryItemType, PantryLocation } from '../../types/pantry';
import styles from './PantryFilters.module.css';

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
    <div className={styles.filters}>
      <h3 className={styles.filtersTitle}>🔍 Filter Items</h3>
      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <label htmlFor="type-filter" className={styles.filterLabel}>
            Item Type
          </label>
          <select
            id="type-filter"
            value={filters.type || ''}
            onChange={handleTypeChange}
            className={styles.filterSelect}
          >
            <option value="">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="location-filter" className={styles.filterLabel}>
            Location
          </label>
          <select
            id="location-filter"
            value={filters.location || ''}
            onChange={handleLocationChange}
            className={styles.filterSelect}
          >
            <option value="">All Locations</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleClear}
          className={styles.clearButton}
        >
          🗑️ Clear Filters
        </button>
      </div>

      {(filters.type || filters.location) && (
        <div className={styles.activeFilters}>
          Active filters: 
          {filters.type && <span className={`${styles.activeFilter} ${styles.activeFilterType}`}>Type: {filters.type}</span>}
          {filters.location && <span className={`${styles.activeFilter} ${styles.activeFilterLocation}`}>Location: {filters.location}</span>}
        </div>
      )}
    </div>
  );
} 