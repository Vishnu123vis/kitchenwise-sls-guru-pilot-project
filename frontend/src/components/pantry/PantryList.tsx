import { useEffect } from 'react';
import { PantryItem } from '../../types/pantry';
import PantryItemComponent from './PantryItem';

// Define proper types for pagination
interface PaginationKey {
  [key: string]: string | number;
}

interface PantryListProps {
  items: PantryItem[];
  loading: boolean;
  error: string | null;
  updateItem: (itemId: string, item: Partial<Omit<PantryItem, 'userId' | 'itemId'>>) => Promise<PantryItem>;
  deleteItem: (itemId: string) => Promise<void>;
  fetchItems: (pageNum?: number) => Promise<void>;
  page: number;
  lastEvaluatedKey: PaginationKey | null;
}

export default function PantryList({ items, loading, error, updateItem, deleteItem, fetchItems, page, lastEvaluatedKey }: PantryListProps) {
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) return <div>Loading pantry...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!items.length) return <div>No pantry items found.</div>;

  return (
    <div>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {items.map(item => (
          <li key={item.itemId} style={{ marginBottom: 8 }}>
            <PantryItemComponent item={item} updateItem={updateItem} deleteItem={deleteItem} />
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button disabled={page === 1} onClick={() => fetchItems(page - 1)}>Previous</button>
        <span>Page {page}</span>
        <button disabled={!lastEvaluatedKey} onClick={() => fetchItems(page + 1)}>Next</button>
      </div>
    </div>
  );
}
