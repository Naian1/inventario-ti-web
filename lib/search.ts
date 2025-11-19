import Fuse from 'fuse.js';
import type { InventoryData, Item } from './types';

export type SearchDoc = {
  id: string;
  categoryId: string;
  name?: string;
  [key: string]: any;
};

export function buildSearchIndex(data: InventoryData) {
  const docs: SearchDoc[] = data.items.map((item) => ({
    id: item.id,
    categoryId: item.categoryId,
    ...item,
    // Create searchable text combining all values
    _searchText: Object.entries(item)
      .filter(([key]) => key !== 'id' && key !== 'categoryId')
      .map(([_, value]) => String(value || '').toLowerCase())
      .join(' ')
  }));

  // Get all unique keys from all items to search across all fields
  const allKeys = new Set<string>();
  docs.forEach(doc => {
    Object.keys(doc).forEach(key => {
      if (key !== 'id' && key !== 'categoryId' && key !== '_searchText') {
        allKeys.add(key);
      }
    });
  });

  return new Fuse(docs, {
    keys: [...Array.from(allKeys), '_searchText'],
    threshold: 0.3,
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: false,
    minMatchCharLength: 2,
  });
}

export function searchInventory(
  index: Fuse<SearchDoc>,
  query: string,
  data: InventoryData
): Item[] {
  const results = index.search(query);
  return results.map((r) => r.item as Item);
}
