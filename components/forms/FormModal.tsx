"use client";
import React from 'react';

export default function FormModal({ title, children, open, onClose, onSubmit }: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost">Cancelar</button>
          <button onClick={onSubmit} className="btn btn-primary">Salvar</button>
        </div>
      </div>
    </div>
  );
}
