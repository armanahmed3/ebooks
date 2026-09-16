import React from 'react';
import { 
  Sparkles, Wrench, Database, FolderCheck, BookOpen, 
  DollarSign, Activity, ChevronRight, ShieldCheck, Plus, Layers
} from 'lucide-react';

export default function Navbar({ 
  activeProject, 
  projects, 
  onSelectProject, 
  onOpenNewProject, 
  onOpenToolbox, 
  onOpenEvidence 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center text-white font-display font-black text-xl tracking-wider shadow-md shadow-pink-500/20">
            E
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-lg text-slate-900 tracking-tight">EMPIRE OS</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-pink-100/80 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200">
                PRO RADAR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse"></span>
              Real-Time Organic Bestseller Engine
            </p>
          </div>
        </div>

        {/* Project Selector & Active Stats */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center bg-pink-50/70 px-3.5 py-1.5 rounded-2xl border border-pink-200/80 shadow-xs">
            <span className="text-xs text-pink-700 font-bold mr-2">Project:</span>
            <select 
              value={activeProject?.id || ''}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-white text-slate-900">{p.name} ({p.niche})</option>
              ))}
            </select>
            <button 
              onClick={onOpenNewProject}
              className="ml-2.5 text-xs bg-pink-600 hover:bg-pink-700 text-white px-2.5 py-1 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          {activeProject && (
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-xl border border-pink-100 shadow-xs text-slate-700">
                <Activity className="w-3.5 h-3.5 text-pink-500" />
                <span className="font-bold">{activeProject.stage}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-xl border border-pink-100 shadow-xs text-slate-700">
                <Database className="w-3.5 h-3.5 text-pink-500" />
                <span className="font-bold">{activeProject.evidence_count || 0} Evidence</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-xl border border-pink-100 shadow-xs text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-pink-500" />
                <span className="font-bold">{activeProject.book_progress || 0}/110 Pages</span>
              </div>
            </div>
          )}
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button 
            onClick={onOpenEvidence}
            className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-slate-700 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all shadow-xs cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden sm:inline">Evidence Vault</span>
          </button>

          <button 
            onClick={() => onOpenToolbox('coach')}
            className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Toolbox (11 Tools)</span>
          </button>
        </div>

      </div>
    </header>
  );
}
