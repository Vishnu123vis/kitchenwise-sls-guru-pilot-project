import { useState } from 'react';
import { PantryItem as PantryItemType } from '../../types/pantry';

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
      <form onSubmit={handleUpdate} style={{ border: '1px solid #ddd', borderRadius: 4, padding: 8, marginBottom: 8 }}>
        <input name="title" value={form.title} onChange={handleChange} required maxLength={50} style={{ marginRight: 8 }} />
        <input name="count" type="number" min={1} value={form.count} onChange={handleChange} required style={{ width: 60, marginRight: 8 }} />
        <input name="expiryDate" value={form.expiryDate} onChange={handleChange} required style={{ marginRight: 8 }} />
        <input name="notes" value={form.notes} onChange={handleChange} maxLength={200} style={{ marginRight: 8 }} />
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={() => setEditMode(false)} style={{ marginLeft: 8 }}>Cancel</button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    );
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 8 }}>
      <div><b>{item.title}</b> ({item.type})</div>
      <div>Location: {item.location}</div>
      <div>Expires: {item.expiryDate}</div>
      <div>Count: {item.count}</div>
      {item.notes && <div>Notes: {item.notes}</div>}
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setEditMode(true)} style={{ marginRight: 8 }}>Edit</button>
        <button onClick={handleDelete} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
