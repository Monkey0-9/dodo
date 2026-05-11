import React from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (id: string) => void;
  onCreateAgent: () => void;
}

export const Layout = ({ children, currentPath, onNavigate, onCreateAgent }: LayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-on-surface">
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64">
        <TopHeader onNavigate={onNavigate} onCreateAgent={onCreateAgent} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
      
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};
