import PantryForm from './PantryForm';
import PantryList from './PantryList';
import PantryFilters from './PantryFilters';
import { usePantryItems } from '../../hooks/usePantryItems';

export default function PantryDashboard() {
  const pantry = usePantryItems();
  
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h2>Pantry</h2>
      <PantryForm createItem={pantry.createItem} />
      
      <PantryFilters
        filters={pantry.filters}
        onApplyFilters={pantry.applyFilters}
        onClearFilters={pantry.clearFilters}
      />
      
      <PantryList
        items={pantry.items}
        loading={pantry.loading}
        error={pantry.error}
        updateItem={pantry.updateItem}
        deleteItem={pantry.deleteItem}
        fetchItems={pantry.fetchItems}
        page={pantry.page}
        setPage={pantry.setPage}
        lastEvaluatedKey={pantry.lastEvaluatedKey}
        pages={pantry.pages}
      />
    </div>
  );
}
