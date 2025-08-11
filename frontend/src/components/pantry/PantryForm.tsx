import { useState } from 'react';
import { PantryItemType, PantryLocation, PantryItem } from '../../types/pantry';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required maxLength={50} style={{ marginRight: 8 }} />
      <select name="type" value={form.type} onChange={handleChange} style={{ marginRight: 8 }}>
        {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select name="location" value={form.location} onChange={handleChange} style={{ marginRight: 8 }}>
        {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <input name="expiryDate" value={form.expiryDate} onChange={handleChange} placeholder="YYYY-MM-DD" required style={{ marginRight: 8 }} />
      <input name="count" type="number" min={1} value={form.count} onChange={handleChange} required style={{ width: 60, marginRight: 8 }} />
      <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" maxLength={200} style={{ marginRight: 8 }} />
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
}
