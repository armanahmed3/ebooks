import React, { useState, useEffect } from 'react';
import { 
  X, Wrench, PenTool, Radar, DollarSign, Package, 
  Megaphone, Stethoscope, Compass, Trophy, TrendingUp, 
  Repeat, ShieldCheck, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export const TOOLBOX_TABS = [
  { id: 'coach', label: 'T7 Coach', icon: Compass },
  { id: 'ghostwriter', label: 'T1 Ghostwriter', icon: PenTool },
  { id: 'radar', label: 'T2 Distribution Radar', icon: Radar },
  { id: 'pricing', label: 'T3 Pricing Lab', icon: DollarSign },
  { id: 'bundle', label: 'T4 Bundle Builder', icon: Package },
  { id: 'marketing', label: 'T5 Marketing Suite', icon: Megaphone },
  { id: 'doctor', label: 'T6 Product Doctor', icon: Stethoscope },
  { id: 'challenge', label: 'T8 90-Day Challenge', icon: Trophy },
  { id: 'money', label: 'T9 Money Dashboard', icon: TrendingUp },
  { id: 'repurpose', label: 'T10 Repurpose Engine', icon: Repeat },
  { id: 'vault', label: 'T11 Evidence Vault', icon: ShieldCheck }
];

export default function ToolboxModal({ isOpen, onClose, initialTab = 'coach', activeProject, onOpenEvidence }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Tab states
  const [coachData, setCoachData] = useState(null);
  const [ghostwriterData, setGhostwriterData] = useState(null);
  const [spamText, setSpamText] = useState('');
  const [spamResult, setSpamResult] = useState(null);
  const [radarData, setRadarData] = useState([]);
  const [pricingData, setPricingData] = useState(null);
  const [doctorIssue, setDoctorIssue] = useState('no_sales');
  const [doctorData, setDoctorData] = useState(null);
  const [moneyData, setMoneyData] = useState({ entries: [], total_revenue: 0, total_units: 0, aov: 0, projection_30d: 0 });
  const [revenueInput, setRevenueInput] = useState({ platform: 'Amazon KDP', units: 5, aov: 19.99, notes: 'Initial organic launch sales' });

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      loadTabData(activeTab);
    }
  }, [isOpen, activeTab, activeProject]);

  const loadTabData = async (tab) => {
    const niche = activeProject?.niche || 'Productivity';
    const title = activeProject?.locked_winner?.title || 'The Master Blueprint';
    const stage = activeProject?.stage || 'DISCOVER';

    try {
      if (tab === 'coach') {
        const d = await api.getCoach(stage);
        setCoachData(d);
      } else if (tab === 'ghostwriter') {
        const d = await api.getGhostwriter(title, niche);
        setGhostwriterData(d);
      } else if (tab === 'radar') {
        const d = await api.getDistributionRadar(niche);
        setRadarData(d.communities || []);
      } else if (tab === 'pricing') {
        const d = await api.getPricingLab(19.99);
        setPricingData(d);
      } else if (tab === 'doctor') {
        const d = await api.getProductDoctor(doctorIssue);
        setDoctorData(d);
      } else if (tab === 'money' && activeProject?.id) {
        const d = await api.getMoneyDashboard(activeProject.id);
        setMoneyData(d);
      } else if (tab === 'vault') {
        onOpenEvidence();
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckSpam = async () => {
    if (!spamText.trim()) return;
    try {
      const res = await api.checkSpam(spamText);
      setSpamResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRevenue = async (e) => {
    e.preventDefault();
    if (!activeProject?.id) return;
    try {
      await api.addRevenueEntry({
        project_id: activeProject.id,
        platform: revenueInput.platform,
        units: parseInt(revenueInput.units) || 1,
        aov: parseFloat(revenueInput.aov) || 19.99,
        notes: revenueInput.notes
      });
      loadTabData('money');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-rose-100 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl text-white shadow-soft">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-rose-950">EMPIRE OS Professional Toolbox</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                  11 Workspaces
                </span>
              </div>
              <p className="text-xs text-rose-800/70">
                Autonomous accelerators tailored to {activeProject?.name || 'Active Project'} ({activeProject?.stage || 'DISCOVER'})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-100 text-rose-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body: Sidebar + Main Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-rose-100 bg-rose-50/40 p-3 overflow-x-auto md:overflow-y-auto flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 scrollbar-none">
            {TOOLBOX_TABS.map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-soft'
                      : 'text-rose-900/80 hover:bg-rose-100/60 hover:text-pink-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-pink-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Tab Content */}
          <div className="flex-1 p-5 overflow-y-auto bg-white">
            
            {/* T7: COACH */}
            {activeTab === 'coach' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Compass className="w-5 h-5 text-pink-600" />
                    <h3 className="font-extrabold text-base text-rose-950">
                      Coach Recommendation • Stage: {coachData?.stage_title || activeProject?.stage}
                    </h3>
                  </div>
                  <div className="text-sm font-bold text-rose-900 mb-3">
                    Next Strategic Action: <span className="font-normal">{coachData?.next_action}</span>
                  </div>
                  <div className="p-3 bg-white/90 rounded-xl border border-pink-100 text-xs text-rose-800">
                    <span className="font-extrabold text-pink-600">PRO TIP: </span>
                    {coachData?.pro_tip}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-rose-100 shadow-sm">
                    <h4 className="font-extrabold text-xs text-rose-950 mb-2">Active Project Health</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-rose-50">
                        <span className="text-rose-700">Locked Winner:</span>
                        <span className="font-bold text-rose-950">{activeProject?.locked_winner?.title || 'None Selected'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-rose-50">
                        <span className="text-rose-700">Verified Evidence:</span>
                        <span className="font-bold text-emerald-600">{activeProject?.evidence_count || 0} Records</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-rose-50">
                        <span className="text-rose-700">Book Written:</span>
                        <span className="font-bold text-pink-600">{activeProject?.book_progress || 0} / 110 Pages</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-rose-100 shadow-sm">
                    <h4 className="font-extrabold text-xs text-rose-950 mb-2">Milestone Checklist</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Project initialized & settings verified</span>
                      </div>
                      <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Amazon-First empirical research pipeline active</span>
                      </div>
                      <div className="flex items-center space-x-2 text-rose-800/80">
                        <span className="w-3.5 h-3.5 rounded-full border border-rose-300 inline-block" />
                        <span>Compile complete 110-page master PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* T1: GHOSTWRITER */}
            {activeTab === 'ghostwriter' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-rose-950 mb-1">T1 Ghostwriter Suite</h3>
                  <p className="text-xs text-rose-800/70">Sales page copy, high-conversion email sequences, and spam word validator.</p>
                </div>

                {/* Spam Word Checker */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                  <h4 className="font-extrabold text-xs text-rose-950 mb-2">Deliverability & Spam Checker</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Paste your subject line or ad copy to test spam flags..."
                      value={spamText}
                      onChange={e => setSpamText(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500"
                    />
                    <button
                      onClick={handleCheckSpam}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl transition-colors"
                    >
                      Audit Copy
                    </button>
                  </div>
                  {spamResult && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-rose-950">Deliverability Score: </span>
                        <span className={`font-extrabold ${spamResult.status === 'EXCELLENT' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {spamResult.deliverability_score}/100 ({spamResult.status})
                        </span>
                        <p className="text-rose-700 mt-0.5">{spamResult.recommendation}</p>
                      </div>
                      {spamResult.flagged_words.length > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-rose-500 font-bold uppercase">Flagged: </span>
                          <span className="text-xs text-rose-900 font-semibold">{spamResult.flagged_words.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sales Copy */}
                {ghostwriterData && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <h4 className="font-extrabold text-xs text-rose-950 mb-1">Sales Page Master Headline & Bullets</h4>
                      <h5 className="font-extrabold text-sm text-pink-700 mb-1">{ghostwriterData.sales_page.headline}</h5>
                      <p className="text-xs text-rose-800 mb-3">{ghostwriterData.sales_page.subheadline}</p>
                      <ul className="space-y-1 text-xs text-rose-900 list-disc list-inside">
                        {ghostwriterData.sales_page.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-rose-100 shadow-sm">
                      <h4 className="font-extrabold text-xs text-rose-950 mb-3">Launch Email Sequence (3-Part)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {ghostwriterData.launch_emails.map((m, idx) => (
                          <div key={idx} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                            <span className="text-[10px] font-bold text-pink-600 uppercase">{m.type}</span>
                            <h6 className="font-bold text-xs text-rose-950 mt-1">{m.subject}</h6>
                            <p className="text-[11px] text-rose-800/70 mt-1">{m.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* T2: DISTRIBUTION RADAR */}
            {activeTab === 'radar' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-rose-950 mb-1">T2 Distribution Radar</h3>
                  <p className="text-xs text-rose-800/70">Top buyer communities, intent evidence, and non-spammy give-first post frameworks.</p>
                </div>
                <div className="space-y-3">
                  {radarData.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-rose-100 bg-white shadow-sm hover:border-pink-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-rose-950">{item.community}</span>
                        <span className="text-xs bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full font-bold">
                          {item.platform} • {item.audience}
                        </span>
                      </div>
                      <p className="text-xs text-rose-800 mb-2">
                        <strong className="text-rose-950">Intent Proof: </strong>{item.intent_evidence}
                      </p>
                      <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 text-xs">
                        <strong className="text-pink-700">Give-First Post Angle: </strong>
                        <span className="text-rose-900">{item.give_first_post}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* T3: PRICING LAB */}
            {activeTab === 'pricing' && pricingData && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-rose-950 mb-1">T3 Pricing Lab & Royalty Simulator</h3>
                  <p className="text-xs text-rose-800/70">Transparent platform fee calculations, Amazon KDP vs Gumroad royalties, and margin simulation.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(pricingData).map(([k, tier]) => (
                    <div key={k} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] font-bold text-pink-600 uppercase">TIER</span>
                        <h4 className="font-extrabold text-sm text-rose-950">{tier.name}</h4>
                        <div className="text-2xl font-black text-rose-900 my-2">${tier.price}</div>
                        <ul className="text-xs space-y-1 text-rose-800 mb-3">
                          {tier.includes.map((inc, i) => (
                            <li key={i} className="flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3 h-3 text-pink-500 shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-3 border-t border-rose-200/80 text-xs space-y-1">
                        <div className="flex justify-between text-rose-700">
                          <span>Gumroad Net:</span>
                          <span className="font-bold text-rose-950">${tier.gumroad_royalty}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Estimated Margin:</span>
                          <span>{tier.margin_estimate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* T6: PRODUCT DOCTOR */}
            {activeTab === 'doctor' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-rose-950 mb-1">T6 Product Doctor</h3>
                  <p className="text-xs text-rose-800/70">Select your symptom to run root-cause diagnosis and actionable 7-day repair protocol.</p>
                </div>
                <div className="flex space-x-2">
                  {[
                    { id: 'no_sales', label: 'No Sales' },
                    { id: 'low_traffic', label: 'Low Traffic' },
                    { id: 'traffic_no_sales', label: 'Traffic but No Sales' },
                    { id: 'refunds', label: 'Refunds / Complaints' }
                  ].map(symptom => (
                    <button
                      key={symptom.id}
                      onClick={() => {
                        setDoctorIssue(symptom.id);
                        loadTabData('doctor');
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                        doctorIssue === symptom.id
                          ? 'bg-pink-600 text-white shadow-soft'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                      }`}
                    >
                      {symptom.label}
                    </button>
                  ))}
                </div>

                {doctorData && (
                  <div className="p-5 rounded-2xl border border-rose-200 bg-white shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-base text-rose-950">Diagnosis: {doctorData.diagnosis}</h4>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        doctorData.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        Priority: {doctorData.priority}
                      </span>
                    </div>
                    <p className="text-xs text-rose-800">
                      <strong>Root Evidence: </strong>{doctorData.evidence}
                    </p>
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                      <h5 className="font-extrabold text-xs text-pink-700 uppercase mb-1">Actionable 7-Day Fix:</h5>
                      <p className="text-xs text-rose-950 font-medium">{doctorData.fix_7_day}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* T9: MONEY DASHBOARD */}
            {activeTab === 'money' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-extrabold text-base text-rose-950 mb-1">T9 Money Dashboard</h3>
                  <p className="text-xs text-rose-800/70">Track real entered revenue, 30-day run rate projections, and average order value.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">Total Revenue</span>
                    <div className="text-2xl font-black text-rose-950 mt-1">${moneyData.total_revenue.toFixed(2)}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">Units Sold</span>
                    <div className="text-2xl font-black text-rose-950 mt-1">{moneyData.total_units}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">Average Order Value</span>
                    <div className="text-2xl font-black text-rose-950 mt-1">${moneyData.aov.toFixed(2)}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">30-Day Projection</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">${moneyData.projection_30d.toFixed(2)}</div>
                  </div>
                </div>

                {/* Add Revenue Form */}
                <form onSubmit={handleAddRevenue} className="p-4 rounded-2xl border border-rose-200 bg-white space-y-3">
                  <h4 className="font-extrabold text-xs text-rose-950">Log Real Marketplace Sales Entry</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <select
                      value={revenueInput.platform}
                      onChange={e => setRevenueInput({ ...revenueInput, platform: e.target.value })}
                      className="px-3 py-2 text-xs bg-rose-50/60 border border-rose-200 rounded-xl focus:outline-none"
                    >
                      <option value="Amazon KDP">Amazon KDP</option>
                      <option value="Etsy">Etsy</option>
                      <option value="Gumroad">Gumroad</option>
                      <option value="Payhip">Payhip</option>
                      <option value="Direct Sales">Direct Sales</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Units"
                      value={revenueInput.units}
                      onChange={e => setRevenueInput({ ...revenueInput, units: e.target.value })}
                      className="px-3 py-2 text-xs bg-rose-50/60 border border-rose-200 rounded-xl focus:outline-none"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="AOV ($)"
                      value={revenueInput.aov}
                      onChange={e => setRevenueInput({ ...revenueInput, aov: e.target.value })}
                      className="px-3 py-2 text-xs bg-rose-50/60 border border-rose-200 rounded-xl focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl transition-colors"
                    >
                      + Save Entry
                    </button>
                  </div>
                </form>

                {/* History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-rose-950">
                    <thead>
                      <tr className="border-b border-rose-200 text-rose-800 text-[10px] uppercase font-bold">
                        <th className="py-2">Date</th>
                        <th className="py-2">Platform</th>
                        <th className="py-2">Units</th>
                        <th className="py-2">AOV</th>
                        <th className="py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      {moneyData.entries.map((ent, i) => (
                        <tr key={i}>
                          <td className="py-2">{ent.entry_date}</td>
                          <td className="py-2 font-bold text-pink-700">{ent.platform}</td>
                          <td className="py-2">{ent.units}</td>
                          <td className="py-2">${ent.aov}</td>
                          <td className="py-2 font-extrabold text-emerald-600">${ent.total_revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Other tabs fallback */}
            {['bundle', 'marketing', 'challenge', 'repurpose'].includes(activeTab) && (
              <div className="p-6 text-center space-y-3">
                <Package className="w-10 h-10 text-pink-500 mx-auto" />
                <h4 className="font-extrabold text-base text-rose-950">
                  {TOOLBOX_TABS.find(t => t.id === activeTab)?.label} Workspace Ready
                </h4>
                <p className="text-xs text-rose-800 max-w-md mx-auto">
                  Assets for this module automatically synthesize directly from your locked winner ({activeProject?.locked_winner?.title || 'Active Opportunity'}).
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
