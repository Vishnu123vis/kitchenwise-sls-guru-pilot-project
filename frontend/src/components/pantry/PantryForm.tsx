import { useState } from 'react';
import { PantryItemType, PantryLocation, PantryItem } from '../../types/pantry';
import styles from './PantryForm.module.css';

const typeOptions: PantryItemType[] = [
  'Dairy', 'Produce', 'Meat', 'Grains', 'Snacks', 'Beverages', 'Condiments', 'Frozen', 'Other'
];
const locationOptions: PantryLocation[] = [
  'Fridge', 'Freezer', 'Pantry', 'Counter', 'Other'
];

interface PantryFormProps {
  createItem: (item: Omit<PantryItem, 'userId' | 'itemId'>) => Promise<PantryItem>;
}

export default function PantryForm({ createItem }: PantryFormProps) {
  const [form, setForm] = useState({
    title: '',
    type: 'Other' as PantryItemType,
    location: 'Other' as PantryLocation,
    expiryDate: '',
    count: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createItem({ ...form, count: Number(form.count) });
      setForm({ title: '', type: 'Other', location: 'Other', expiryDate: '', count: 1, notes: '' });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to add item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.formTitle}>➕ Add New Pantry Item</h3>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Item Name</label>
          <input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="e.g., Milk, Bread, Apples" 
            required 
            maxLength={50} 
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Type</label>
          <select name="type" value={form.type} onChange={handleChange} className={styles.select}>
            {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Location</label>
          <select name="location" value={form.location} onChange={handleChange} className={styles.select}>
            {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Expiry Date</label>
          <input 
            name="expiryDate" 
            value={form.expiryDate} 
            onChange={handleChange} 
            placeholder="YYYY-MM-DD" 
            required 
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Quantity</label>
          <input 
            name="count" 
            type="number" 
            min={1} 
            value={form.count} 
            onChange={handleChange} 
            required 
            className={`${styles.input} ${styles.countInput}`}
          />
        </div>
        
        <div className={`${styles.formGroup} ${styles.notesGroup}`}>
          <label className={styles.label}>Notes (Optional)</label>
          <textarea 
            name="notes" 
            value={form.notes} 
            onChange={handleChange} 
            placeholder="Any additional notes about this item..." 
            maxLength={200} 
            className={`${styles.input} ${styles.notesInput}`}
          />
        </div>
      </div>
      
      <div className={styles.submitSection}>
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? '🔄 Adding...' : '✅ Add Item'}
        </button>
        {error && <div className={styles.error}>❌ {error}</div>}
      </div>
    </form>
  );
}
