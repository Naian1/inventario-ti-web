'use client';
import React, { PropsWithChildren, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { UserSwitcher } from './UserSwitcher';
import { isAdmin } from '@/lib/localStorage';
import QuickActionsFloating from './QuickActionsFloating';

export default function Layout({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  // Ensure sidebar is closed by default on small screens and opened on large screens
  useEffect(() => {
    const applyInitial = () => {
      try {
        const isLarge = window.innerWidth >= 1024; // lg breakpoint
        setSidebarOpen(isLarge);
      } catch (e) {
        // ignore during SSR
      }
    };

    applyInitial();
    const onResize = () => applyInitial();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navItems = [
    { href: '/painel', label: 'Painel', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3z" />
      </svg>
    ), adminOnly: false },
    { href: '/dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zM13 21h8V11h-8v10z" />
      </svg>
    ), adminOnly: false },
    { href: '/categories', label: 'Minhas Categorias', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2 3h10v9H3V7z" />
      </svg>
    ), adminOnly: false },
    { href: '/manage-categories', label: 'Gerenciar Categorias', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
      </svg>
    ), adminOnly: true },
    { href: '/reports', label: 'Relatórios', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
      </svg>
    ), adminOnly: false },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdminUser);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'hidden'} animate-slide-in flex flex-col`}>
        <div className="mb-8">
          <Link href="/painel" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">IT</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Inventário TI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestão</p>
            </div>
          </Link>
        </div>

        <nav className="space-y-2 flex-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
              {item.adminOnly && (
                <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
                  Admin
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="panel bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4">
            <p className="text-sm font-medium mb-2">Dica</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Use Ctrl+K para buscar rapidamente
            </p>
          </div>
          
          <UserSwitcher />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <SearchBar />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Inventário TI - Sistema de Gestão de Equipamentos</p>
        </footer>
      </div>
      <QuickActionsFloating />
    </div>
  );
}
