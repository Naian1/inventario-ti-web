'use client';
import { useEffect, useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { getInitialData } from '@/lib/localStorage';
import type { Category, Item } from '@/lib/types';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { nanoid } from 'nanoid';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'];

interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'pie' | 'line';
  viewMode: 'category' | 'field';
  selectedCategories: string[];
  selectedField?: string;
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [formViewMode, setFormViewMode] = useState<'category' | 'field'>('category');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formField, setFormField] = useState('');

  useEffect(() => {
    loadData();
    loadCharts();
  }, []);

  const loadData = () => {
    const data = getInitialData();
    setCategories(data.categories);
    setItems(data.items);
  };

  const loadCharts = () => {
    const saved = localStorage.getItem('dashboardCharts');
    if (saved) {
      try {
        setCharts(JSON.parse(saved));
      } catch (e) {
        setCharts([]);
      }
    }
  };

  const saveCharts = (newCharts: ChartConfig[]) => {
    localStorage.setItem('dashboardCharts', JSON.stringify(newCharts));
    setCharts(newCharts);
  };

  const openCreateModal = () => {
    setEditingChart(null);
    setFormTitle('');
    setFormType('bar');
    setFormViewMode('category');
    setFormCategories(categories.map(c => c.id));
    setFormField('');
    setShowModal(true);
  };

  const openEditModal = (chart: ChartConfig) => {
    setEditingChart(chart);
    setFormTitle(chart.title);
    setFormType(chart.type);
    setFormViewMode(chart.viewMode);
    setFormCategories(chart.selectedCategories);
    setFormField(chart.selectedField || '');
    setShowModal(true);
  };

  const handleSaveChart = () => {
    if (!formTitle.trim()) {
      alert('Digite um título para o gráfico');
      return;
    }

    if (formViewMode === 'field' && !formField) {
      alert('Selecione um campo');
      return;
    }

    const chartConfig: ChartConfig = {
      id: editingChart?.id || nanoid(),
      title: formTitle,
      type: formType,
      viewMode: formViewMode,
      selectedCategories: formCategories,
      selectedField: formViewMode === 'field' ? formField : undefined,
    };

    if (editingChart) {
      saveCharts(charts.map(c => c.id === editingChart.id ? chartConfig : c));
    } else {
      saveCharts([...charts, chartConfig]);
    }

    setShowModal(false);
  };

  const handleDeleteChart = (chartId: string) => {
    if (confirm('Deseja excluir este gráfico?')) {
      saveCharts(charts.filter(c => c.id !== chartId));
    }
  };

  const toggleFormCategory = (categoryId: string) => {
    setFormCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleAllFormCategories = () => {
    if (formCategories.length === categories.length) {
      setFormCategories([]);
    } else {
      setFormCategories(categories.map(c => c.id));
    }
  };

  const availableFields = useMemo(() => {
    const fieldsMap = new Map<string, { name: string; type: string }>();
    
    categories.forEach(category => {
      if (category.fields && Array.isArray(category.fields)) {
        category.fields.forEach(field => {
          if (!fieldsMap.has(field.key)) {
            fieldsMap.set(field.key, { name: field.name, type: field.type });
          }
        });
      }
    });
    
    return Array.from(fieldsMap.entries()).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, [categories]);

  return (
    <Layout>
      <div className="content">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Analítico
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crie e personalize gráficos para visualizar seus dados
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Criar Gráfico
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="panel bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Itens</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="panel bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📁</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categorias</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="panel bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gráficos Criados</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{charts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {charts.length === 0 ? (
          <div className="panel text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Nenhum gráfico criado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Crie gráficos personalizados. Você pode criar quantos quiser!
            </p>
            <button
              onClick={openCreateModal}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Criar Primeiro Gráfico
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map(chart => (
              <ChartCard
                key={chart.id}
                chart={chart}
                categories={categories}
                items={items}
                availableFields={availableFields}
                onEdit={() => openEditModal(chart)}
                onDelete={() => handleDeleteChart(chart.id)}
              />
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingChart ? 'Editar Gráfico' : 'Criar Novo Gráfico'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Título do Gráfico</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Distribuição de Equipamentos"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Tipo de Gráfico</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['bar', 'pie', 'line'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormType(type)}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          formType === type
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {type === 'bar' ? '📊 Barras' : type === 'pie' ? '🥧 Pizza' : '📈 Linha'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Visualizar por:</label>
                  <div className="flex gap-3">
                    {(['category', 'field'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setFormViewMode(mode);
                          if (mode === 'category') setFormField('');
                        }}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                          formViewMode === mode
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {mode === 'category' ? '📁 Categorias' : '🏷️ Campo Específico'}
                      </button>
                    ))}
                  </div>
                </div>

                {formViewMode === 'field' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Selecione o Campo:</label>
                    <select
                      value={formField}
                      onChange={(e) => setFormField(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                      <option value="">-- Escolha um campo --</option>
                      {availableFields.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.name} ({field.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">Filtrar Categorias:</label>
                    <button
                      type="button"
                      onClick={toggleAllFormCategories}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                    >
                      {formCategories.length === categories.length ? 'Desmarcar Todas' : 'Marcar Todas'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    {categories.map(category => (
                      <label
                        key={category.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                          formCategories.includes(category.id)
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                            : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formCategories.includes(category.id)}
                          onChange={() => toggleFormCategory(category.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium truncate">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChart}
                    className="flex-1 btn btn-primary"
                  >
                    {editingChart ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function ChartCard({ 
  chart, 
  categories, 
  items, 
  availableFields,
  onEdit, 
  onDelete 
}: { 
  chart: ChartConfig;
  categories: Category[];
  items: Item[];
  availableFields: { key: string; name: string; type: string }[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const chartData = useMemo(() => {
    const filteredItems = items.filter(item => chart.selectedCategories.includes(item.categoryId));

    if (chart.viewMode === 'category') {
      return categories
        .filter(cat => chart.selectedCategories.includes(cat.id))
        .map(category => ({
          name: category.name,
          quantidade: filteredItems.filter(item => item.categoryId === category.id).length,
        }));
    } else {
      if (!chart.selectedField) return [];
      
      const valuesMap = new Map<string, number>();
      
      filteredItems.forEach(item => {
        const value = item.data[chart.selectedField!];
        if (value !== undefined && value !== null && value !== '') {
          const strValue = String(value);
          valuesMap.set(strValue, (valuesMap.get(strValue) || 0) + 1);
        }
      });
      
      return Array.from(valuesMap.entries())
        .map(([value, count]) => ({ name: value, quantidade: count }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 15);
    }
  }, [chart, categories, items]);

  const renderChart = () => {
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado disponível</div>;
    }

    const commonTooltip = {
      contentStyle: { 
        backgroundColor: '#1f2937', 
        border: '1px solid #374151',
        borderRadius: '8px',
        color: '#f3f4f6'
      }
    };

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip {...commonTooltip} />
              <Bar dataKey="quantidade" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="quantidade"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...commonTooltip} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip {...commonTooltip} />
              <Line type="monotone" dataKey="quantidade" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const fieldName = chart.selectedField 
    ? availableFields.find(f => f.key === chart.selectedField)?.name || chart.selectedField
    : '';

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{chart.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {chart.viewMode === 'category' ? 'Por Categoria' : `Campo: ${fieldName}`}
            {' • '}
            {chartData.length} {chartData.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center" title="Editar">
            ✏️
          </button>
          <button onClick={onDelete} className="w-8 h-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-red-600" title="Excluir">
            🗑️
          </button>
        </div>
      </div>
      {renderChart()}
    </div>
  );
}
