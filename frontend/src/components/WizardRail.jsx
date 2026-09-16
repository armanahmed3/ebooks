import React from 'react';
import { 
  Sliders, Search, Award, Compass, BookOpen, 
  FileText, Send, LayoutDashboard, CheckCircle2, Lock 
} from 'lucide-react';

export const STAGES = [
  { id: 'setup', title: '1. Setup', icon: Sliders, requires: null },
  { id: 'hunter', title: '2. Product Hunter', icon: Search, requires: null },
  { id: 'winner', title: '3. Winner Deep-Dive', icon: Award, requires: 'candidate' },
  { id: 'blueprint', title: '4. Blueprint & Avatar', icon: Compass, requires: 'candidate' },
  { id: 'forge', title: '5. Book Forge & PDF', icon: BookOpen, requires: 'candidate' },
  { id: 'listings', title: '6. Multi Listings', icon: FileText, requires: 'candidate' },
  { id: 'outreach', title: '7. Outreach & Excel', icon: Send, requires: 'candidate' },
  { id: 'dashboard', title: '8. Dashboard', icon: LayoutDashboard, requires: null }
];

export default function WizardRail({ currentTab, onChangeTab, activeProject }) {
  const hasWinner = Boolean(activeProject?.locked_winner);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-pink-100/80 py-2.5 px-4 shadow-xs sticky top-16 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto space-x-1.5 scrollbar-none">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const isActive = currentTab === stage.id;
          
          return (
            <button
              key={stage.id}
              onClick={() => onChangeTab(stage.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25'
                  : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/70 border border-transparent hover:border-pink-100'
              }`}
              title={stage.title}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-pink-500'}`} />
              <span>{stage.title}</span>
              {hasWinner && stage.requires === 'candidate' ? (
                <CheckCircle2 className={`w-3 h-3 ml-1 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
