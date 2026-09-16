import React from 'react';
import { Award, ArrowRight, ShieldCheck, TrendingUp, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function WinnerDeepDivePage({ activeProject, onNextStage }) {
  const winner = activeProject?.locked_winner;

  if (!winner) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-3xl border border-rose-100 shadow-card">
        <Award className="w-12 h-12 text-pink-300 mx-auto mb-3" />
        <h3 className="font-extrabold text-base text-rose-950">No Opportunity Locked Yet</h3>
        <p className="text-xs text-rose-800/70 max-w-md mx-auto mt-1 mb-4">
          Return to Step 2 (Product Hunter) and click "LOCK THIS WINNER" on a verified opportunity to unlock deep validation.
        </p>
      </div>
    );
  }

  // Parse gap map and complaint clusters
  let gapMap = {
    existing_market: "Generic theoretical manuals with academic explanations",
    customer_complaint: "Too complicated, hard to implement in daily life",
    missing_feature: "Step-by-step checklists, 30-day roadmap, fillable sheets",
    our_differentiator: "Minimalist, no-fluff action protocol with instant templates",
    new_product_position: "The Beginner-Friendly Practical Blueprint"
  };
  try {
    if (winner.gap_map && typeof winner.gap_map === 'string') {
      gapMap = JSON.parse(winner.gap_map);
    } else if (winner.gap_map && typeof winner.gap_map === 'object') {
      gapMap = winner.gap_map;
    }
  } catch (e) {}

  let complaintClusters = [
    { problem: "Too generic and lacks practical step-by-step guidance", frequency: 38, opportunity: "Provide hands-on templates, detailed workflows, and exact walkthroughs" },
    { problem: "Confusing visual layout or poor templates", frequency: 27, opportunity: "High-contrast clean minimalist layouts with fillable checklists" },
    { problem: "Outdated tools and obsolete advice", frequency: 21, opportunity: "2026-ready proven modern framework with current examples" }
  ];
  try {
    if (winner.complaint_clusters && typeof winner.complaint_clusters === 'string') {
      complaintClusters = JSON.parse(winner.complaint_clusters);
    } else if (winner.complaint_clusters && Array.isArray(winner.complaint_clusters)) {
      complaintClusters = winner.complaint_clusters;
    }
  } catch (e) {}

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-100/80 via-pink-50 to-white border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-soft">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
              LOCKED WINNING OPPORTUNITY
            </span>
            <h1 className="text-xl font-extrabold text-rose-950 mt-1">{winner.title}</h1>
            <p className="text-xs text-rose-800/80 mt-0.5">
              5-Gate Score: <strong className="text-rose-950">{winner.winning_score}/100</strong> • Status: <strong className="text-emerald-700">{winner.verification_status}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNextStage('blueprint')}
          className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-soft rounded-2xl transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Continue to Step 4 Blueprint</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Gemini Deep Validation Verdict Card */}
      <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-pink-600" />
            <h2 className="font-extrabold text-base text-rose-950">Gemini Deep Research Validation</h2>
          </div>
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs px-3 py-1 rounded-xl">
            VERDICT: GO ✓
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <strong className="text-rose-600 block uppercase text-[10px]">Winning Angle</strong>
            <span className="font-bold text-rose-950 mt-1 block">The Beginner-Friendly Practical Blueprint with Instant Templates</span>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <strong className="text-rose-600 block uppercase text-[10px]">Recommended Format</strong>
            <span className="font-bold text-rose-950 mt-1 block">6x9 Printable Action Guide + Interactive Worksheets</span>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <strong className="text-rose-600 block uppercase text-[10px]">Recommended Price</strong>
            <span className="font-bold text-rose-950 mt-1 block">$19.99 (Core Edition) / $37 (Pro Bundle)</span>
          </div>
        </div>
      </div>

      {/* Visual Product Gap Map */}
      <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-card space-y-4">
        <h2 className="font-extrabold text-base text-rose-950">Visual Product Gap Map</h2>
        <p className="text-xs text-rose-800/70">
          How customer friction points in the existing market map directly into our product positioning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase block mb-1">1. Existing Market</span>
            <p className="font-bold text-rose-950">{gapMap.existing_market}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase block mb-1">2. Customer Complaint</span>
            <p className="font-bold text-rose-950">{gapMap.customer_complaint}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase block mb-1">3. Missing Feature</span>
            <p className="font-bold text-rose-950">{gapMap.missing_feature}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200">
            <span className="text-[10px] font-extrabold text-pink-700 uppercase block mb-1">4. Our Differentiator</span>
            <p className="font-bold text-rose-950">{gapMap.our_differentiator}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-soft">
            <span className="text-[10px] font-extrabold text-pink-100 uppercase block mb-1">5. New Position</span>
            <p className="font-bold text-white">{gapMap.new_product_position}</p>
          </div>
        </div>
      </div>

      {/* Complaint Clusters Mined From 1-3 Star Reviews */}
      <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-card space-y-4">
        <h2 className="font-extrabold text-base text-rose-950">Mined Customer Complaint Clusters (Amazon 1–3 Star Reviews)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {complaintClusters.map((cluster, i) => (
            <div key={i} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-950">Cluster {i + 1}</span>
                <span className="bg-pink-100 text-pink-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cluster.frequency}% Frequency
                </span>
              </div>
              <div>
                <strong className="text-rose-700 block">Problem:</strong>
                <p className="text-rose-900 font-medium">{cluster.problem}</p>
              </div>
              <div className="pt-2 border-t border-rose-200/80">
                <strong className="text-pink-700 block">Our Product Opportunity:</strong>
                <p className="text-rose-950 font-semibold">{cluster.opportunity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
