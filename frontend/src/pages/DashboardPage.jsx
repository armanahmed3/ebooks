import React from 'react';
import { 
  LayoutDashboard, ShieldCheck, BookOpen, DollarSign, Database, 
  Download, FileSpreadsheet, FileDown, CheckCircle2, ArrowRight, Activity 
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage({ activeProject, onChangeTab, onOpenEvidence }) {
  const winner = activeProject?.locked_winner;

  const handleDownloadPdf = async () => {
    if (!activeProject?.id) return;
    try {
      const res = await api.buildPdf(activeProject.id);
      if (res.download_url) {
        window.open(res.download_url, '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadExcel = () => {
    if (!activeProject?.id) return;
    window.open(`/api/outreach/download-excel/${activeProject.id}`, '_blank');
  };

  const handleExportJson = async () => {
    if (!activeProject?.id) return;
    window.open(`/api/projects/${activeProject.id}/export`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-pink-900 to-rose-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black tracking-widest bg-pink-500/30 text-pink-200 px-3 py-1 rounded-full border border-pink-400/40">
              ACTIVE INTELLIGENCE PROJECT
            </span>
            <span className="text-xs text-pink-200">• Stage: {activeProject?.stage || 'DISCOVER'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">{activeProject?.name || 'Empire Product System'}</h1>
          <p className="text-xs text-pink-100/80 mt-1 max-w-xl">
            Target Niche: <strong className="text-white">{activeProject?.niche || 'N/A'}</strong> • Locked Winner: <strong className="text-pink-300">{winner?.title || 'None Selected'}</strong>
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-soft transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download 6×9 PDF</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-soft transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export 5-Tab Excel</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-card">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Winning Score</span>
            <ShieldCheck className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-3xl font-black text-rose-950 mt-1">
            {winner?.winning_score || 0}<span className="text-xs font-normal text-rose-600">/100</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">
            {winner?.verification_status || 'Unverified'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-card">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Evidence Vault</span>
            <Database className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-3xl font-black text-rose-950 mt-1">
            {activeProject?.evidence_count || 0}
          </div>
          <button 
            onClick={onOpenEvidence}
            className="text-[10px] text-pink-600 hover:underline font-bold mt-1"
          >
            View Verified Records →
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-card">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Book Forge Progress</span>
            <BookOpen className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-3xl font-black text-rose-950 mt-1">
            {activeProject?.book_progress || 0}<span className="text-xs font-normal text-rose-600">/110</span>
          </div>
          <p className="text-[10px] text-rose-700 font-medium mt-1">
            Publication 6×9 Layout
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-card">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Logged Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-rose-950 mt-1">
            ${(activeProject?.revenue || 0).toFixed(2)}
          </div>
          <p className="text-[10px] text-rose-700 font-medium mt-1">
            Direct & Platform Sales
          </p>
        </div>

      </div>

      {/* Project Workflow Progression & Export JSON */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base text-rose-950">Operating Engine Workflow</h2>
          <button
            onClick={handleExportJson}
            className="text-xs font-bold text-rose-700 hover:text-pink-600 flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Project JSON</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { stage: 'setup', name: 'Step 1: Setup', status: 'Completed', icon: CheckCircle2 },
            { stage: 'hunter', name: 'Step 2: Hunter', status: 'Active', icon: Activity },
            { stage: 'winner', name: 'Step 3: Validation', status: winner ? 'Completed' : 'Locked', icon: ShieldCheck },
            { stage: 'forge', name: 'Step 5: Book Forge', status: (activeProject?.book_progress > 0) ? 'In Progress' : 'Ready', icon: BookOpen }
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                onClick={() => onChangeTab(s.stage)}
                className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-pink-300 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">{s.name}</span>
                  <Icon className="w-3.5 h-3.5 text-pink-500" />
                </div>
                <span className="text-[10px] text-rose-700 block font-semibold">{s.status}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
