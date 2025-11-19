'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getInitialData } from '@/lib/localStorage';

export default function ReportsPage() {
  const [data, setData] = useState({ categories: [], items: [], totalItems: 0 });

  useEffect(() => {
    const inventoryData = getInitialData();
    setData({
      categories: inventoryData.categories,
      items: inventoryData.items,
      totalItems: inventoryData.items.length,
    });
  }, []);

  return (
    <Layout>
      <div className="content">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📈 Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise e exportação de dados do inventário
          </p>
        </div>

        <div className="panel text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">Em Desenvolvimento</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Esta funcionalidade estará disponível em breve. Aqui você poderá gerar relatórios personalizados e exportar dados.
          </p>
        </div>
      </div>
    </Layout>
  );
}
