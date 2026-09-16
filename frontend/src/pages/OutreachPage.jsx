import React, { useState, useEffect } from 'react';
import { Send, FileSpreadsheet, Download, CheckCircle2, ArrowRight, UserCheck, Mail, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

export default function OutreachPage({ activeProject, onNextStage }) {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      loadOutreach();
    }
  }, [activeProject]);

  const loadOutreach = async () => {
    setLoading(true);
    try {
      const data = await api.getOutreach(activeProject.id);
      setProspects(data.prospects || []);
      if (data.prospects?.length > 0) {
        setSelectedProspect(data.prospects[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!activeProject?.id) return;
    window.open(`/api/outreach/download-excel/${activeProject.id}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-100/80 via-pink-50 to-white border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-soft">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-rose-950">Step 7: Influencer Outreach Engine & 5-Tab Excel Export</h1>
            <p className="text-xs text-rose-800/80 mt-0.5">
              Targeted creator discovery, personalized VIP review pitches, and openpyxl 5-tab campaign tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-soft rounded-2xl transition-all cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT 5-TAB EXCEL (.XLSX)</span>
          </button>

          <button
            onClick={() => onNextStage('dashboard')}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-soft rounded-2xl transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Finish to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Guideline Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
        <span className="font-extrabold">Outreach Protocol Rule: </span>
        <span>
          EMPIRE OS never automatically sends unsolicited messages. All drafts are prepared for your manual review and approval.
        </span>
      </div>

      {/* Prospects & Pitch Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prospects List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-extrabold text-sm text-rose-950">Curated Creator Prospects</h2>
          <div className="space-y-2">
            {prospects.map(p => {
              const isSelected = selectedProspect?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProspect(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                    isSelected
                      ? 'border-pink-500 bg-rose-50/50 shadow-soft ring-2 ring-pink-500/20'
                      : 'border-rose-100 bg-white hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-rose-950">{p.name}</span>
                    <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                      {p.platform}
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-600 font-semibold">{p.handle} • {p.follower_band}</div>
                  <p className="text-[11px] text-rose-800 line-clamp-2">{p.why_match}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Prospect Personalized Pitch Draft */}
        <div className="lg:col-span-2 space-y-4">
          {selectedProspect ? (
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div>
                  <h3 className="font-extrabold text-base text-rose-950">{selectedProspect.name}</h3>
                  <p className="text-xs text-rose-700">{selectedProspect.handle} • {selectedProspect.audience}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                    Priority Score: {selectedProspect.priority_score}/100
                  </span>
                </div>
              </div>

              {/* Collaboration Angle */}
              <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 text-xs">
                <strong className="text-pink-700 block mb-0.5">Collaboration Angle:</strong>
                <span className="text-rose-950">{selectedProspect.collaboration_angle}</span>
              </div>

              {/* Email Pitch Draft */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-rose-950">
                  <Mail className="w-4 h-4 text-pink-600" />
                  <span>Personalized Email Pitch (TAB2_EMAIL_QUEUE)</span>
                </div>
                <div className="p-4 bg-rose-50/30 rounded-xl border border-rose-100 text-xs text-rose-950 whitespace-pre-line leading-relaxed">
                  {selectedProspect.email_draft}
                </div>
              </div>

              {/* DM Pitch Draft */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-rose-950">
                  <MessageSquare className="w-4 h-4 text-pink-600" />
                  <span>2-Sentence Short-Form DM (TAB3_DM_QUEUE)</span>
                </div>
                <div className="p-4 bg-rose-50/30 rounded-xl border border-rose-100 text-xs text-rose-950 italic">
                  "{selectedProspect.dm_draft}"
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-xs text-rose-600">Select a prospect to view drafts.</div>
          )}
        </div>

      </div>

    </div>
  );
}
