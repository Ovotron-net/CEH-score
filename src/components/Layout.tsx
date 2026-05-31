'use client';

import { useState, useCallback } from 'react';
import { Menu, Shield } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const close = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-screen bg-[#0a0e1a]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={close} />

      <main className="flex-1 overflow-auto min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#111827] border-b border-[#1f2d40] sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#64748b] hover:text-white transition-colors p-1"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00ff88]" />
            <span className="text-white font-bold text-sm">CEH Tracker</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
