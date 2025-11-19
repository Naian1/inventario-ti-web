'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getInitialData, saveData, canManageCategories } from '@/lib/localStorage';
import { CategoryManager } from '@/components/CategoryManager';
import type { Category } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function ManageCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!canManageCategories()) {
      alert('⛔ Acesso negado! Apenas administradores podem gerenciar categorias.');
      router.push('/painel');
      return;
    }
    setHasPermission(true);
    loadCategories();
  }, [router]);

  const loadCategories = () => {
    const data = getInitialData();
    setCategories(data.categories);
  };

  const deleteCategory = (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Todos os itens serão removidos!')) {
      return;
    }

    const data = getInitialData();
    data.categories = data.categories.filter((c) => c.id !== categoryId);
    data.items = data.items.filter((i) => i.categoryId !== categoryId);
    data.fields = data.fields.filter((f) => f.categoryId !== categoryId);
    saveData(data);
    loadCategories();
    alert('✅ Categoria excluída com sucesso!');
  };

  const getItemCount = (categoryId: string) => {
    const data = getInitialData();
    return data.items.filter((item) => item.categoryId === categoryId).length;
  };

  if (!hasPermission) {
    return null;
  }

  return (
    <Layout>
      <div className="content">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Área administrativa - Criar, editar e excluir categorias
              </p>
            </div>
          </div>

          <div className="panel bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Área Restrita - Somente Administradores
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Usuários normais podem apenas adicionar itens às categorias existentes.
                  Aqui você pode criar, editar e excluir categorias do sistema.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {categories.length} {categories.length === 1 ? 'Categoria' : 'Categorias'}
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + Criar Nova Categoria
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="panel text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📁</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Nenhuma categoria criada</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Crie sua primeira categoria para começar a organizar o inventário
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              + Criar Primeira Categoria
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const itemCount = getItemCount(category.id);
              return (
                <div key={category.id} className="panel">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{itemCount}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {itemCount} {itemCount === 1 ? 'item' : 'itens'} cadastrados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/categories/${category.id}`)}
                        className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        👁️ Visualizar
                      </button>
                      <button
                        onClick={() => router.push(`/manage-categories/${category.id}/edit`)}
                        className="px-4 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        ✏️ Editar Campos
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CategoryManager
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadCategories();
            setShowCreateModal(false);
          }}
        />
      )}
    </Layout>
  );
}
