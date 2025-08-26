import { useState } from 'react';
import { PantryItem as PantryItemType } from '../../types/pantry';
import styles from './PantryItem.module.css';

interface PantryItemProps {
  item: PantryItemType;
  updateItem: (itemId: string, item: Partial<Omit<PantryItemType, 'userId' | 'itemId'>>) => Promise<PantryItemType>;
  deleteItem: (itemId: string) => Promise<void>;
}

export default function PantryItem({ item, updateItem, deleteItem }: PantryItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    title: item.title,
    count: item.count,
    expiryDate: item.expiryDate,
    notes: item.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateItem(item.itemId, {
        title: form.title,
        count: Number(form.count),
        expiryDate: form.expiryDate,
        notes: form.notes,
      });
      setEditMode(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteItem(item.itemId);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (editMode) {
    return (
      <form onSubmit={handleUpdate} className={styles.editForm}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Item Name</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              maxLength={50} 
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Quantity</label>
            <input 
              name="count" 
              type="number" 
              min={1} 
              value={form.count} 
              onChange={handleChange} 
              required 
              className={`${styles.formInput} ${styles.countInput}`}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Expiry Date</label>
            <input 
              name="expiryDate" 
              value={form.expiryDate} 
              onChange={handleChange} 
              required 
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Notes</label>
            <input 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              maxLength={200} 
              className={styles.formInput}
            />
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={`${styles.actionButton} ${styles.saveButton}`}>
            {loading ? '🔄 Saving...' : '💾 Save'}
          </button>
          <button type="button" onClick={() => setEditMode(false)} className={`${styles.actionButton} ${styles.cancelButton}`}>
            ❌ Cancel
          </button>
        </div>
        
        {error && <div className={styles.error}>❌ {error}</div>}
      </form>
    );
  }

  return (
    <div className={styles.item}>
      <div className={styles.itemHeader}>
        <h4 className={styles.itemTitle}>{item.title}</h4>
        <span className={styles.itemType}>{item.type}</span>
      </div>
      
      <div className={styles.itemDetails}>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>📍 Location</span>
          <span className={styles.detailValue}>{item.location}</span>
        </div>
        
        <div className={styles.detail}>
          <span className={styles.detailLabel}>⏰ Expires</span>
          <span className={styles.detailValue}>{item.expiryDate}</span>
        </div>
        
        <div className={styles.detail}>
          <span className={styles.detailLabel}>🔢 Quantity</span>
          <span className={styles.detailValue}>{item.count}</span>
        </div>
      </div>
      
      {item.notes && (
        <div className={styles.itemNotes}>
          <div className={styles.notesLabel}>📝 Notes</div>
          <div className={styles.notesText}>{item.notes}</div>
        </div>
      )}
      
      <div className={styles.itemActions}>
        <button onClick={() => setEditMode(true)} className={`${styles.actionButton} ${styles.editButton}`}>
          ✏️ Edit
        </button>
        <button onClick={handleDelete} disabled={loading} className={`${styles.actionButton} ${styles.deleteButton}`}>
          {loading ? '🔄 Deleting...' : '🗑️ Delete'}
        </button>
      </div>
      
      {error && <div className={styles.error}>❌ {error}</div>}
    </div>
  );
}
