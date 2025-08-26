import PantryForm from './PantryForm';
import PantryList from './PantryList';
import PantryFilters from './PantryFilters';
import { usePantryItems } from '../../hooks/usePantryItems';
import styles from './PantryDashboard.module.css';

export default function PantryDashboard() {
  const pantry = usePantryItems();
  
  return (
    <div className={styles.pantryDashboard}>
      <h1 className={styles.title}>🥫 Pantry Management</h1>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>➕ Add New Item</h2>
        <PantryForm createItem={pantry.createItem} />
      </div>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🔍 Filters</h2>
        <PantryFilters
          filters={pantry.filters}
          onApplyFilters={pantry.applyFilters}
          onClearFilters={pantry.clearFilters}
        />
      </div>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📋 Inventory</h2>
        <PantryList
          items={pantry.items}
          loading={pantry.loading}
          error={pantry.error}
          updateItem={pantry.updateItem}
          deleteItem={pantry.deleteItem}
          fetchItems={pantry.fetchItems}
          page={pantry.page}
          lastEvaluatedKey={pantry.lastEvaluatedKey}
        />
      </div>
    </div>
  );
}
