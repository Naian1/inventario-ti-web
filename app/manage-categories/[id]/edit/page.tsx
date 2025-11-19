'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getInitialData, saveData, canManageCategories } from '@/lib/localStorage';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import type { Category, Field } from '@/lib/types';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [newField, setNewField] = useState({ name: '', key: '', type: 'string' as const });
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!canManageCategories()) {
      alert('⛔ Acesso negado! Apenas administradores podem editar categorias.');
      router.push('/painel');
      return;
    }
    setHasPermission(true);
    loadCategory();
  }, [params.id, router]);

  const loadCategory = () => {
    const data = getInitialData();
    const cat = data.categories.find((c) => c.id === params.id);
    if (!cat) {
      alert('Categoria não encontrada');
      router.push('/manage-categories');
      return;
    }
    setCategory(cat);
    const categoryFields = data.fields.filter((f) => f.categoryId === params.id);
    setFields(categoryFields);
  };

  const addField = () => {
    if (!newField.name.trim() || !newField.key.trim()) {
      alert('Preencha o nome e a chave do campo');
      return;
    }

    const data = getInitialData();
    const field: Field = {
      id: nanoid(),
      categoryId: params.id,
      name: newField.name.trim(),
      key: newField.key.trim().toLowerCase(),
      type: newField.type,
    };

    data.fields.push(field);
    saveData(data);
    setNewField({ name: '', key: '', type: 'string' });
    loadCategory();
    alert('✅ Campo adicionado com sucesso!');
  };

  const editField = (field: Field) => {
    setEditingField({ ...field });
  };

  const saveEditedField = () => {
    if (!editingField || !editingField.name.trim() || !editingField.key.trim()) {
      alert('Preencha o nome e a chave do campo');
      return;
    }

    const data = getInitialData();
    const fieldIndex = data.fields.findIndex((f) => f.id === editingField.id);
    if (fieldIndex !== -1) {
      data.fields[fieldIndex] = editingField;
      saveData(data);
      setEditingField(null);
      loadCategory();
      alert('✅ Campo atualizado com sucesso!');
    }
  };

  const deleteField = (fieldId: string) => {
    if (!confirm('Tem certeza que deseja excluir este campo?')) return;

    const data = getInitialData();
    data.fields = data.fields.filter((f) => f.id !== fieldId);
    saveData(data);
    loadCategory();
    alert('✅ Campo excluído com sucesso!');
  };

  const updateCategoryName = () => {
    if (!category) return;
    const newName = prompt('Novo nome da categoria:', category.name);
    if (!newName || !newName.trim()) return;

    const data = getInitialData();
    const cat = data.categories.find((c) => c.id === params.id);
    if (cat) {
      cat.name = newName.trim();
      saveData(data);
      loadCategory();
      alert('✅ Nome atualizado com sucesso!');
    }
  };

  if (!hasPermission || !category) {
    return null;
  }

  return (
    <Layout>
      <div className="content">
        <div className="mb-8">
          <button
            onClick={() => router.push('/manage-categories')}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-2"
          >
            ← Voltar para Gestão de Categorias
          </button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">✏️ Editar Categoria</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerenciar campos da categoria "{category.name}"
              </p>
            </div>
            <button
              onClick={updateCategoryName}
              className="btn btn-ghost"
            >
              Renomear Categoria
            </button>
          </div>

          <div className="panel bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Atenção ao Editar Campos
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Ao adicionar novos campos, eles aparecerão em todos os itens desta categoria.
                  Ao excluir campos, os dados existentes serão mantidos mas o campo não será mais exibido.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Adicionar Novo Campo */}
        <div className="panel mb-8">
          <h2 className="text-xl font-semibold mb-4">➕ Adicionar Novo Campo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Campo</label>
              <input
                type="text"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                placeholder="Ex: Patrimônio"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Chave (ID)</label>
              <input
                type="text"
                value={newField.key}
                onChange={(e) => setNewField({ ...newField, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                placeholder="Ex: patrimonio"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="string">Texto</option>
                <option value="number">Número</option>
                <option value="boolean">Sim/Não</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">&nbsp;</label>
              <button
                onClick={addField}
                disabled={!newField.name.trim() || !newField.key.trim()}
                className="btn btn-primary w-full"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Campos */}
        <div className="panel">
          <h2 className="text-xl font-semibold mb-4">Campos Cadastrados ({fields.length})</h2>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Nenhum campo cadastrado ainda</p>
              <p className="text-sm mt-2">Adicione campos para estruturar os dados desta categoria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{field.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Chave: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{field.key}</code>
                      {' • '}
                      Tipo: {field.type === 'string' ? 'Texto' : field.type === 'number' ? 'Número' : 'Sim/Não'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editField(field)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                      title="Editar campo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteField(field.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                      title="Excluir campo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Field Modal */}
        {editingField && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold">✏️ Editar Campo</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Campo</label>
                  <input
                    type="text"
                    value={editingField.name}
                    onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                    placeholder="Ex: Patrimônio"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Chave (ID)</label>
                  <input
                    type="text"
                    value={editingField.key}
                    onChange={(e) => setEditingField({ ...editingField, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="Ex: patrimonio"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={editingField.type}
                    onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="string">Texto</option>
                    <option value="number">Número</option>
                    <option value="boolean">Sim/Não</option>
                  </select>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
                <button onClick={() => setEditingField(null)} className="btn btn-ghost">
                  Cancelar
                </button>
                <button onClick={saveEditedField} className="btn btn-primary">
                  ✓ Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
