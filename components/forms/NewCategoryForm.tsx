"use client";
import { useState } from 'react';
import { getInitialData, saveData } from '@/lib/localStorage';
import { nanoid } from 'nanoid';

export default function NewCategoryForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return alert('Informe um nome para a categoria');
    const data = getInitialData();
    data.categories.push({ id: nanoid(), name: name.trim() });
    saveData(data);
    setName('');
    onCreated?.();
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Nome da Categoria</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded" />
      <div className="flex justify-end">
        <button onClick={handleCreate} className="btn btn-primary">Criar Categoria</button>
      </div>
    </div>
  );
}
