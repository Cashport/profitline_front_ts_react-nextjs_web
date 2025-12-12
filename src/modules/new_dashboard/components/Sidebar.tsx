import React from 'react';
import { CircleDollarSign, PieChart, Wallet, Settings, FileText, Map as MapIcon } from 'lucide-react';
import { Tab } from '../lib/types';


interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const menuItems = [
    { id: Tab.COLLECTION, icon: CircleDollarSign, label: 'Recaudo' },
    { id: Tab.PORTFOLIO, icon: PieChart, label: 'Cartera' },
    { id: Tab.MANAGEMENT, icon: Wallet, label: 'Gestión' },
    { id: Tab.MAP, icon: MapIcon, label: 'Mapa' },
    { id: 'reports', icon: FileText, label: 'Reportes' },
    { id: 'settings', icon: Settings, label: 'Config' },
  ];

  const handleTabClick = (id: string) => {
    if (id === 'settings') {
      onOpenSettings();
    } else if (id !== 'reports') {
      setActiveTab(id as Tab);
    }
  };

  return (
    <>
      {/* FLOATING DOCK NAVIGATION (Responsive for both Mobile and Desktop) */}
      <nav className="fixed z-50 transition-all duration-300
        bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 px-4 pb-safe
        md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-auto md:h-auto md:border md:rounded-full md:shadow-2xl md:px-8 md:py-3 md:bg-white/95 md:backdrop-blur-md"
      >
        <div className="flex justify-around md:justify-center items-center h-full w-full md:gap-8">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const isAction = item.id === 'settings' || item.id === 'reports';
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`group flex flex-col items-center justify-center p-1 md:p-2 rounded-xl transition-all duration-200
                  ${isActive ? 'md:-translate-y-1' : 'hover:bg-gray-50'}
                `}
              >
                <div className={`p-2 rounded-full transition-all duration-300 relative
                  ${isActive ? 'bg-[#141414] text-[#CBE71E] shadow-lg shadow-black/20' : 'text-gray-400 group-hover:text-gray-600'}
                `}>
                   <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#CBE71E] rounded-full md:hidden"></span>
                  )}
                </div>
                <span className={`text-[10px] font-medium mt-1 transition-colors hidden md:block
                  ${isActive ? 'text-[#141414] font-bold' : 'text-gray-400'}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;