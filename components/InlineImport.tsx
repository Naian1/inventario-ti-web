'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { getInitialData, saveData, canAddItems } from '@/lib/localStorage';
import { nanoid } from 'nanoid';

export function InlineImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createNewCategory, setCreateNewCategory] = useState(false);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [autoCreateFields, setAutoCreateFields] = useState(true);
  const [showMapping, setShowMapping] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();

    // Preview data
    if (ext === 'csv') {
      Papa.parse(selectedFile, {
        header: true,
        preview: 5,
        complete: (result) => {
          setPreviewData(result.data as any[]);
          setShowModal(true);
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const headers = rows[0] as string[];
        const dataRows = rows.slice(1, 6).map((row: any) => {
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        });
        setPreviewData(dataRows);
        setShowModal(true);
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    if (!canAddItems()) {
      alert('Você não tem permissão para importar dados.');
      return;
    }

    setIsImporting(true);
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (result) => {
            processImport(result.data as any[]);
          },
        });
      } else if (ext === 'xlsx' || ext === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const wb = XLSX.read(e.target?.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws);
          processImport(rows);
        };
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      alert('Erro ao importar arquivo. Verifique o formato.');
      setIsImporting(false);
    }
  };

  const processImport = (rows: any[]) => {
    const data = getInitialData();
    let categoryId = selectedCategory;

    // Criar nova categoria se necessário
    if (createNewCategory && newCategoryName.trim()) {
      const newCategoryId = nanoid();
      data.categories.push({
        id: newCategoryId,
        name: newCategoryName.trim(),
      });
      categoryId = newCategoryId;
    }

    if (!categoryId) {
      alert('Selecione uma categoria ou crie uma nova!');
      setIsImporting(false);
      return;
    }

    // Auto-criar campos se ativado
    if (autoCreateFields && rows.length > 0) {
      const existingFields = data.fields.filter(f => f.categoryId === categoryId);
      const existingFieldKeys = new Set(existingFields.map(f => f.key));
      
      const firstRow = rows[0];
      Object.keys(firstRow).forEach(columnName => {
        const fieldKey = columnName.toLowerCase().replace(/\s+/g, '_');
        
        if (!existingFieldKeys.has(fieldKey)) {
          data.fields.push({
            id: nanoid(),
            categoryId,
            name: columnName,
            key: fieldKey,
            type: 'string'
          });
        }
      });
    }

    rows.forEach((row: any) => {
      const mappedRow: any = { id: nanoid(), categoryId };
      
      // Apply column mapping or use direct mapping
      Object.entries(row).forEach(([key, value]) => {
        const targetKey = columnMapping[key] || key.toLowerCase().replace(/\s+/g, '_');
        if (value !== undefined && value !== null && value !== '') {
          mappedRow[targetKey] = value;
        }
      });

      data.items.push(mappedRow);
    });

    saveData(data);
    alert(`✅ ${rows.length} itens importados com sucesso${createNewCategory ? ` na nova categoria "${newCategoryName}"` : ''}!`);
    setFile(null);
    setShowModal(false);
    setIsImporting(false);
    setPreviewData(null);
    setColumnMapping({});
    setNewCategoryName('');
    setCreateNewCategory(false);
    setShowMapping(false);
    setAutoCreateFields(true);
    window.location.reload(); // Recarrega para mostrar nova categoria
  };

  const categories = getInitialData().categories;

  if (!mounted) return (
    <button
      onClick={() => setShowModal(true)}
      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span>Importar Arquivo (CSV, XLSX)</span>
    </button>
  );

  const modalContent = showModal && (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
        onClick={() => setShowModal(false)}
      />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-2xl font-bold mb-2">Importar Dados</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Selecione um arquivo e configure a importação
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* File Selection */}
              {!previewData && (
                <div>
                  <label className="block w-full">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-4">
                        <svg className="w-16 h-16 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="text-center">
                          <p className="text-lg font-medium mb-2">
                            {file ? file.name : 'Clique ou arraste um arquivo'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Arquivos CSV, XLSX ou XLS
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {previewData && (
                <>
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  📁 Para onde vão os dados?
                </label>
                
                <div className="space-y-3">
                  {/* Opção: Categoria Existente */}
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    !createNewCategory ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`} onClick={() => setCreateNewCategory(false)}>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        checked={!createNewCategory}
                        onChange={() => setCreateNewCategory(false)}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">Categoria Existente</span>
                    </div>
                    {!createNewCategory && (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mt-2"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Opção: Nova Categoria */}
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    createNewCategory ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                  }`} onClick={() => setCreateNewCategory(true)}>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        checked={createNewCategory}
                        onChange={() => setCreateNewCategory(true)}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">➕ Criar Nova Categoria</span>
                    </div>
                    {createNewCategory && (
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ex: Tablets, Impressoras, Televisões..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mt-2"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Auto-create Fields Option */}
              {(selectedCategory || createNewCategory) && (
                <div className="panel bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="autoCreateFields"
                      checked={autoCreateFields}
                      onChange={(e) => setAutoCreateFields(e.target.checked)}
                      className="mt-1 w-5 h-5"
                    />
                    <div className="flex-1">
                      <label htmlFor="autoCreateFields" className="font-semibold cursor-pointer flex items-center gap-2">
                        ⚡ Criar campos automaticamente
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">RECOMENDADO</span>
                      </label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        As colunas da planilha ({Object.keys(previewData[0] || {}).join(', ')}) serão criadas como campos na categoria automaticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Mapping */}
              {!autoCreateFields && selectedCategory && (
                <div>
                  <button
                    onClick={() => setShowMapping(!showMapping)}
                    className="btn btn-ghost mb-3"
                  >
                    {showMapping ? '▼' : '▶'} Mapeamento Avançado de Colunas
                  </button>
                  
                  {showMapping && (() => {
                    const data = getInitialData();
                    const categoryFields = data.fields.filter(f => f.categoryId === selectedCategory);
                    const columns = Object.keys(previewData[0] || {});
                    
                    return (
                      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Conecte as colunas da planilha com os campos da categoria:
                        </p>
                        {columns.map(column => (
                          <div key={column} className="flex items-center gap-3">
                            <div className="flex-1 font-medium">{column}</div>
                            <span>→</span>
                            <select
                              value={columnMapping[column] || ''}
                              onChange={(e) => setColumnMapping({...columnMapping, [column]: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                            >
                              <option value="">Usar nome da coluna</option>
                              {categoryFields.map(field => (
                                <option key={field.id} value={field.key}>{field.name} ({field.key})</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Preview Table */}
              <div>
                <h4 className="font-semibold mb-3">Pré-visualização ({previewData.length} primeiras linhas)</h4>
                <div className="table-container max-h-64 overflow-auto">
                  <table className="text-sm">
                    <thead>
                      <tr>
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <th key={key} className="px-3 py-2">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value: any, j) => (
                            <td key={j} className="px-3 py-2">{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
              )}
            </div>

            {previewData && (
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setFile(null);
                  setPreviewData(null);
                }}
                className="btn btn-ghost"
                disabled={isImporting}
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || (!selectedCategory && !createNewCategory) || (createNewCategory && !newCategoryName.trim())}
                className="btn btn-primary"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    {createNewCategory ? '✓ Criar e Importar' : '✓ Confirmar Importação'}
                  </>
                )}
              </button>
            </div>
            )}
          </div>
        </div>
      </>
    );

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>Importar Arquivo (CSV, XLSX)</span>
      </button>
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
