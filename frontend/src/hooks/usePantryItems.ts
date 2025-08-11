import { useState, useCallback } from 'react';
import { PantryItem, PantryItemType, PantryLocation } from '../types/pantry';
import * as pantryApi from '../api/pantryItems';

// Define proper types for pagination
interface PaginationKey {
  [key: string]: string | number;
}

export function usePantryItems() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<PaginationKey | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<(PaginationKey | null)[]>([null]); // store keys for each page
  const [filters, setFilters] = useState<{ type?: PantryItemType; location?: PantryLocation }>({});

  const fetchItems = useCallback(async (pageNum = 1, newFilters?: { type?: PantryItemType; location?: PantryLocation }) => {
    setLoading(true);
    setError(null);
    
    const currentFilters = newFilters || filters;
    if (newFilters) {
      setFilters(newFilters);
      setPage(1);
      setPages([null]);
    }
    
    try {
      const key = pages[pageNum - 1] || undefined;
      const data = await pantryApi.listPantryItems(key, currentFilters.type, currentFilters.location);
      setItems(data.items);
      setLastEvaluatedKey(data.lastEvaluatedKey || null);
      setPage(pageNum);
      // Store the key for the next page if it exists
      if (data.lastEvaluatedKey && pages.length === pageNum) {
        setPages(prev => [...prev, data.lastEvaluatedKey!]);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch items';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pages, filters]);

  const createItem = useCallback(async (item: Omit<PantryItem, 'userId' | 'itemId'>) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await pantryApi.createPantryItem(item);
      setItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create item';
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, item: Partial<Omit<PantryItem, 'userId' | 'itemId'>>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await pantryApi.updatePantryItem(itemId, item);
      setItems((prev) => prev.map((i) => (i.itemId === itemId ? updatedItem : i)));
      return updatedItem;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update item';
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    setLoading(true);
    setError(null);
    try {
      await pantryApi.deletePantryItem(itemId);
      setItems((prev) => prev.filter((i) => i.itemId !== itemId));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete item';
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback((newFilters: { type?: PantryItemType; location?: PantryLocation }) => {
    fetchItems(1, newFilters);
  }, [fetchItems]);

  const clearFilters = useCallback(() => {
    fetchItems(1, {});
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    page,
    setPage,
    lastEvaluatedKey,
    pages,
    applyFilters,
    clearFilters,
    filters,
  };
}

