import { useEffect } from 'react';
import { PantryItem } from '../../types/pantry';
import PantryItemComponent from './PantryItem';
import styles from './PantryList.module.css';

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

  if (loading) return <div className={styles.loading}>🔄 Loading pantry...</div>;
  if (error) return <div className={styles.error}>❌ Error: {error}</div>;
  if (!items.length) return <div className={styles.empty}>📭 No pantry items found.</div>;

  return (
    <div className={styles.list}>
      <h3 className={styles.listTitle}>📋 Inventory Items</h3>
      <ul className={styles.itemsList}>
        {items.map(item => (
          <li key={item.itemId} className={styles.item}>
            <PantryItemComponent item={item} updateItem={updateItem} deleteItem={deleteItem} />
          </li>
        ))}
      </ul>
      <div className={styles.pagination}>
        <button 
          disabled={page === 1} 
          onClick={() => fetchItems(page - 1)}
          className={styles.paginationButton}
        >
          ⬅️ Previous
        </button>
        <span className={styles.pageInfo}>Page {page}</span>
        <button 
          disabled={!lastEvaluatedKey} 
          onClick={() => fetchItems(page + 1)}
          className={styles.paginationButton}
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
}
