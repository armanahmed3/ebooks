import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, User, ArrowRight, Layers, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function BlueprintPage({ activeProject, onNextStage }) {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState(0);

  useEffect(() => {
    if (activeProject?.id) {
      loadBlueprint();
    }
  }, [activeProject]);

  const loadBlueprint = async () => {
    setLoading(true);
    try {
      const data = await api.getBlueprint(activeProject.id);
      setBlueprint(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-rose-600 text-sm font-semibold">Loading master blueprint architecture...</div>;
  }

  if (!blueprint?.has_winner) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-rose-100 shadow-card">
        <Compass className="w-12 h-12 text-pink-300 mx-auto mb-3" />
        <h3 className="font-extrabold text-base text-rose-950">No Opportunity Locked</h3>
        <p className="text-xs text-rose-800/70">Lock a verified candidate in Step 2 to generate your blueprint.</p>
      </div>
    );
  }

  const avatar = blueprint.reader_avatar;
  const titles = blueprint.titles || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-100/80 via-pink-50 to-white border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-soft">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-rose-950">Step 4: Blueprint & Reader Avatar</h1>
            <p className="text-xs text-rose-800/80 mt-0.5">
              10 AI-scored title/subtitles, grounded Reader-One persona, and 110-page structural book plan.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNextStage('forge')}
          className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-soft rounded-2xl transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Continue to Step 5 Book Forge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 10 Title/Subtitle Options */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base text-rose-950">10 Title & Subtitle Combinations</h2>
            <p className="text-xs text-rose-800/70">Scored on market clarity, search volume match, and promise finishability.</p>
          </div>
          <span className="text-xs font-bold text-pink-700 bg-pink-100 px-3 py-1 rounded-full">
            Recommended: #{selectedTitleIdx + 1}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {titles.map((t, idx) => {
            const isSelected = selectedTitleIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedTitleIdx(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-pink-500 bg-rose-50/50 shadow-soft ring-2 ring-pink-500/20'
                    : 'border-rose-100 hover:border-pink-200 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-rose-400">#{idx + 1}</span>
                    <h4 className="font-extrabold text-xs text-rose-950">{t.title}</h4>
                  </div>
                  <p className="text-[11px] text-rose-800">{t.subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-pink-600">{t.score}</span>
                  <span className="text-[10px] text-rose-400 block font-bold">SCORE</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reader Avatar (Reader-One) */}
      {avatar && (
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-pink-600" />
            <h2 className="font-extrabold text-base text-rose-950">Reader-One Avatar Persona</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
              <span className="text-[10px] font-bold text-pink-600 uppercase">Core Demographics</span>
              <div className="font-bold text-rose-950 text-sm">{avatar.name}, {avatar.age}</div>
              <div className="text-rose-800"><strong>Role: </strong>{avatar.job}</div>
              <div className="text-rose-800"><strong>Lifestyle: </strong>{avatar.lifestyle}</div>
              <div className="text-rose-800 pt-1 border-t border-rose-200/80">
                <strong>Search Moment: </strong>{avatar.search_moment}
              </div>
            </div>

            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
              <span className="text-[10px] font-bold text-pink-600 uppercase">Observed Customer Language</span>
              <ul className="space-y-2 text-rose-900 list-disc list-inside">
                {avatar.observed_quotes?.map((q, i) => (
                  <li key={i} className="italic">"{q}"</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
              <span className="text-[10px] font-bold text-pink-600 uppercase">AI Strategic Interpretation</span>
              <ul className="space-y-2 text-rose-900 list-disc list-inside">
                {avatar.ai_interpretation?.map((ai, i) => (
                  <li key={i}>{ai}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 110-Page Structural Architecture Preview */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-pink-600" />
            <h2 className="font-extrabold text-base text-rose-950">110-Page Structural Architecture</h2>
          </div>
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
            110 Defined Modules
          </span>
        </div>
        <p className="text-xs text-rose-800/70">
          Every page is mapped with a title, summary objective, and visual illustration plan.
        </p>

        <div className="overflow-x-auto max-h-80 border border-rose-100 rounded-2xl">
          <table className="w-full text-left text-xs text-rose-950">
            <thead className="bg-rose-50 sticky top-0 border-b border-rose-200 text-rose-800 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 w-16">Page #</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Objective & Summary</th>
                <th className="py-2.5 px-3">Visual Illustration Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {Array.from({ length: 15 }).map((_, idx) => (
                <tr key={idx} className="hover:bg-rose-50/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-pink-600">{String(idx + 1).padStart(3, '0')}</td>
                  <td className="py-2.5 px-3 font-bold text-rose-950">Section {idx + 1}</td>
                  <td className="py-2.5 px-3 text-rose-800">Direct tactical action item overcoming decision fatigue.</td>
                  <td className="py-2.5 px-3 text-rose-600 italic text-[11px]">Minimalist clean diagram and fillable checklist</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
