'use client';
import { useState, useEffect } from 'react';
import { getInitialData } from '@/lib/localStorage';
import type { Category } from '@/lib/types';

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  gradient: string;
  description?: string;
  trend?: { value: number; isPositive: boolean };
}

export function StatsCard({ title, value, icon, gradient, description, trend }: StatsCardProps) {
  return (
    <div className="panel overflow-hidden relative group">
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-100`}></div>
      
      <div className="relative z-10 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
            <p className="text-4xl font-bold text-white">{value.toLocaleString('pt-BR')}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl backdrop-blur-sm">
            {icon}
          </div>
        </div>
        
        {description && (
          <p className="text-white/80 text-sm">{description}</p>
        )}
        
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-sm ${trend.isPositive ? 'text-white/90' : 'text-white/80'}`}>
            <svg className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>↑ {Math.abs(trend.value)}% este mês</span>
          </div>
        )}
      </div>
      
      {/* Decorative element */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
    </div>
  );
}

export function CategoryDistribution() {
  const [data, setData] = useState<{ category: Category; count: number }[]>([]);

  useEffect(() => {
    const inventoryData = getInitialData();
    const distribution = inventoryData.categories.map((cat) => ({
      category: cat,
      count: inventoryData.items.filter((item) => item.categoryId === cat.id).length,
    }));
    setData(distribution.sort((a, b) => b.count - a.count));
  }, []);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
  ];

  return (
    <div className="panel">
      <h3 className="text-lg font-semibold mb-4">Distribuição por Categoria</h3>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Nenhuma categoria cadastrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.category.id}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium">{item.category.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RecentActivity() {
  const activities = [
    { id: 1, action: 'Importação', description: '50 computadores importados', time: '2 horas atrás', icon: '📥', color: 'bg-blue-500' },
    { id: 2, action: 'Atualização', description: 'Setor 9º andar atualizado', time: '5 horas atrás', icon: '✏️', color: 'bg-green-500' },
    { id: 3, action: 'Nova Categoria', description: 'Televisões criada', time: '1 dia atrás', icon: '📁', color: 'bg-purple-500' },
  ];

  return (
    <div className="panel">
      <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{activity.action}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickActions() {
  const actions = [
    { label: 'Importar CSV', icon: '📥', color: 'from-blue-500 to-blue-600' },
    { label: 'Nova Categoria', icon: '📁', color: 'from-purple-500 to-purple-600' },
    { label: 'Exportar Dados', icon: '📤', color: 'from-green-500 to-green-600' },
    { label: 'Relatório', icon: '📊', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="panel">
      <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`p-4 bg-gradient-to-br ${action.color} text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col items-center gap-2 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
