import React from 'react';
import { LayoutDashboard, Mail, PlusCircle, Settings, LogOut, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ page, icon: Icon, label }: { page: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        currentPage === page
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white h-full">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Mail className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">PixelTrack</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem page="dashboard" icon={LayoutDashboard} label="Panel (Dashboard)" />
          <NavItem page="generator" icon={PlusCircle} label="Yeni Takip Oluştur" />
          <NavItem page="list" icon={Mail} label="E-Posta Listesi" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white cursor-pointer">
            <LogOut size={20} />
            <span>Çıkış Yap</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 h-16 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Mail className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold">PixelTrack</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 z-40 pt-20 px-4 space-y-2 md:hidden">
          <NavItem page="dashboard" icon={LayoutDashboard} label="Panel" />
          <NavItem page="generator" icon={PlusCircle} label="Yeni Takip" />
          <NavItem page="list" icon={Mail} label="Liste" />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
