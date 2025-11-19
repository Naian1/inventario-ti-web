'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getInitialData } from '@/lib/localStorage';
import type { Category } from '@/lib/types';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const data = getInitialData();
    setCategories(data.categories);
  };

  const getCategoryCount = (categoryId: string) => {
    const data = getInitialData();
    return data.items.filter((item) => item.categoryId === categoryId).length;
  };

  const gradients = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
    'from-red-500 to-red-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
  ];

  return (
    <Layout>
      <div className="content">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Categorias</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize e acesse todas as categorias de equipamentos
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="panel text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📁</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Nenhuma categoria disponível</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Solicite a um administrador para criar categorias
            </p>
            <Link href="/painel" className="btn btn-primary">
              ← Voltar ao Painel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const count = getCategoryCount(category.id);
              const gradient = gradients[index % gradients.length];

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="panel hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="text-white font-bold text-xl">{count}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="font-medium">{count} {count === 1 ? 'equipamento' : 'equipamentos'}</span>
                    </div>
                    
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                      Visualizar categoria
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
