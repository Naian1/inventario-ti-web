'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getInitialData, saveData } from '@/lib/localStorage';
import Link from 'next/link';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: any[];
  query: string;
}

export function SearchResultsModal({ isOpen, onClose, results: initialResults, query }: SearchResultsModalProps) {
  const [results, setResults] = useState(initialResults);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setResults(initialResults);
  }, [initialResults]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const data = getInitialData();

  const getCategoryName = (categoryId: string) => {
    return data.categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({ ...item });
  };

  const handleSave = () => {
    if (!editingItem) return;

    const data = getInitialData();
    const itemIndex = data.items.findIndex(i => i.id === editingItem.id);
    
    if (itemIndex !== -1) {
      // Update keeping the id and categoryId
      data.items[itemIndex] = { 
        ...editForm,
        id: editingItem.id,
        categoryId: editingItem.categoryId
      };
      saveData(data);
      
      // Update local results
      const updatedResults = results.map(r => 
        r.id === editingItem.id ? { 
          ...editForm,
          id: editingItem.id,
          categoryId: editingItem.categoryId
        } : r
      );
      setResults(updatedResults);
      
      setEditingItem(null);
      setEditForm({});
      
      // Force reload to show updated data
      window.location.reload();
    }
  };

  const handleDelete = (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const data = getInitialData();
    data.items = data.items.filter(i => i.id !== itemId);
    saveData(data);

    const updatedResults = results.filter(r => r.id !== itemId);
    setResults(updatedResults);
  };

  const grouped = results.reduce((acc, item) => {
    const catId = item.categoryId;
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Main Results Modal */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 shadow-lg z-10 rounded-t-xl">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Resultados da Busca
                </h1>
                <p className="text-sm text-gray-400">
                  {results.length} resultado(s) encontrado(s)
                  {query && <span className="ml-2">para "{query}"</span>}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Fechar
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {results.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <p>Nenhum resultado encontrado</p>
              </div>
            ) : (
              Object.entries(grouped).map(([categoryId, categoryItems]) => {
                const categoryFields = data.fields.filter(f => f.categoryId === categoryId);
                const fieldKeys = categoryFields.length > 0 
                  ? categoryFields.map(f => f.key)
                  : Array.from(new Set(
                      (categoryItems as any[]).flatMap(item => 
                        Object.keys(item).filter(k => k !== 'id' && k !== 'categoryId')
                      )
                    ));

                return (
                  <div key={categoryId} className="mb-8">
                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">{getCategoryName(categoryId)}</h2>
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                          {(categoryItems as any[]).length} item(ns)
                        </span>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="bg-gray-800 rounded-b-xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">#</th>
                              {fieldKeys.map(key => {
                                const field = categoryFields.find(f => f.key === key);
                                return (
                                  <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                                    {field?.name || key}
                                  </th>
                                );
                              })}
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {(categoryItems as any[]).map((item: any, index: number) => (
                              <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                                {fieldKeys.map(key => (
                                  <td key={key} className="px-4 py-3 text-sm text-gray-200">
                                    {item[key] || '-'}
                                  </td>
                                ))}
                                <td className="px-4 py-3 text-sm text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="text-blue-400 hover:text-blue-300 transition-colors"
                                      title="Editar"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                      title="Excluir"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                    <Link
                                      href={`/categories/${categoryId}?item=${item.id}`}
                                      onClick={onClose}
                                      className="text-purple-400 hover:text-purple-300 transition-colors"
                                      title="Ver detalhes"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <>
          <div className="fixed inset-0 bg-black/80 z-[10001]" onClick={() => {
            setEditingItem(null);
            setEditForm({});
          }} />
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Editar Item</h3>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setEditForm({});
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {Object.keys(editForm).filter(key => key !== 'id' && key !== 'categoryId').map(key => {
                  const categoryFields = data.fields.filter(f => f.categoryId === editForm.categoryId);
                  const field = categoryFields.find(f => f.key === key);
                  
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field?.name || key}
                      </label>
                      <input
                        type="text"
                        value={editForm[key] || ''}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setEditForm({});
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}
