import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, ArrowLeft, X } from 'lucide-react';

interface ExpandableCardProps {
  title: React.ReactNode;
  children: (isExpanded: boolean) => React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({ 
  title, 
  children, 
  className = '',
  noPadding = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isExpanded]);

  // Full Screen View
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F7F7F7] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm flex-shrink-0 z-50">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 group"
                aria-label="Volver"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {title}
              </div>
           </div>
           <button 
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
           >
              <Minimize2 size={16} />
              <span className="hidden sm:inline">Minimizar</span>
           </button>
        </div>

        {/* Content Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
             <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 h-full w-full relative flex flex-col ${noPadding ? 'p-0' : 'p-6'}`}>
                {children(true)}
             </div>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 relative group transition-all hover:shadow-md flex flex-col ${className}`}>
        {/* Card Header */}
        <div className={`flex justify-between items-start mb-2 ${noPadding ? 'p-4 md:p-5 pb-0' : 'p-4 md:p-5 pb-0'}`}>
            <div className="flex-1 text-sm font-bold text-gray-800">{title}</div>
            <button 
                onClick={() => setIsExpanded(true)}
                className="p-1.5 text-gray-400 hover:text-[#141414] hover:bg-gray-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 ml-2"
                title="Ampliar vista"
            >
                <Maximize2 size={18} />
            </button>
        </div>
        
        {/* Card Content */}
        <div className={`flex-1 w-full ${noPadding ? '' : 'px-4 md:px-5 pb-4 md:pb-5'}`}>
            {children(false)}
        </div>
    </div>
  );
};

export default ExpandableCard;