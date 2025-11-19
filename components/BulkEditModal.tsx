'use client';
import { useState } from 'react';
import type { Field, Item } from '@/lib/types';

export function BulkEditModal({ open, onClose, fields, items, onApply }: { open: boolean; onClose: () => void; fields: Field[]; items: Item[]; onApply: (updated: Item[]) => void; }) {
  const [fieldKey, setFieldKey] = useState<string>(fields[0]?.key ?? '');
  const [value, setValue] = useState('');

  if (!open) return null;

  const handleApply = () => {
    const updated = items.map((item) => ({ ...item, [fieldKey]: value }));
    onApply(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edição em Massa</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Campo</label>
          <select
            value={fieldKey}
            onChange={(e) => setFieldKey(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.key}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Novo Valor</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
