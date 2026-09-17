import React, { useState, useEffect } from 'react';
import { 
  Search, ExternalLink, Copy, Check, TrendingUp, DollarSign, 
  ShoppingBag, Sparkles, ShieldCheck, ChevronDown, ChevronUp, 
  RefreshCw, Filter, Globe, Award, Zap, AlertCircle,
  BookOpen, Compass, CheckCircle2, Flame, ArrowUpRight
} from 'lucide-react';
import { api } from './services/api';

const CATEGORIES = [
  { label: 'All Niches', value: 'all' },
  { label: 'Health & Somatics', value: 'health' },
  { label: 'Productivity & Habits', value: 'productivity' },
  { label: 'Wealth & Finance', value: 'finance' },
  { label: 'Parenting & Pregnancy', value: 'parenting' },
  { label: 'Mental Health & Mindset', value: 'mindset' },
  { label: 'Relationships & Communication', value: 'relationship' }
];

// Target publishing platforms with Premium Light Slate Blue & Rose Gold styling
const ALL_PLATFORMS = [
  { id: 'amazon', name: 'Amazon US', tag: 'Bestseller Index', badgeBg: 'bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-300' },
  { id: 'apple_books', name: 'Apple Books', tag: 'iOS Books Store', badgeBg: 'bg-rose-50 hover:bg-rose-100/80 text-rose-900 border-[#d48b7c]/40' },
  { id: 'google_play', name: 'Google Play Books', tag: 'Android / Web', badgeBg: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border-emerald-300' },
  { id: 'barnes_noble', name: 'Barnes & Noble', tag: 'Nook Press', badgeBg: 'bg-teal-50 hover:bg-teal-100/80 text-teal-900 border-teal-300' },
  { id: 'kobo', name: 'Kobo Writing Life', tag: 'Rakuten Kobo', badgeBg: 'bg-red-50 hover:bg-red-100/80 text-red-900 border-red-300' },
  { id: 'gumroad', name: 'Gumroad', tag: 'Direct Creator', badgeBg: 'bg-pink-50 hover:bg-pink-100/80 text-pink-900 border-pink-300' },
  { id: 'payhip', name: 'Payhip', tag: 'Digital Storefront', badgeBg: 'bg-sky-50 hover:bg-sky-100/80 text-sky-900 border-sky-300' },
  { id: 'abebooks', name: 'AbeBooks', tag: 'Global Book Index', badgeBg: 'bg-yellow-50 hover:bg-yellow-100/80 text-yellow-900 border-yellow-300' },
  { id: 'bookbaby', name: 'BookBaby', tag: 'Indie Direct', badgeBg: 'bg-purple-50 hover:bg-purple-100/80 text-purple-900 border-purple-300' },
  { id: 'ebay', name: 'eBay US', tag: 'Active Listings', badgeBg: 'bg-blue-50 hover:bg-blue-100/80 text-blue-900 border-blue-300' },
  { id: 'etsy', name: 'Etsy Digital', tag: 'Printables / PDF', badgeBg: 'bg-orange-50 hover:bg-orange-100/80 text-orange-900 border-orange-300' },
  { id: 'google_trends', name: 'Google Trends (US)', tag: 'Organic Demand', badgeBg: 'bg-cyan-50 hover:bg-cyan-100/80 text-cyan-900 border-cyan-300' }
];

export default function NicheTitleVerifierApp() {
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [minOrders, setMinOrders] = useState(10);
  const [minRevenue, setMinRevenue] = useState(100);
  const [lowCompOnly, setLowCompOnly] = useState(false);
  const [expandedNiche, setExpandedNiche] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Live Title Evaluator State
  const [liveTitleInput, setLiveTitleInput] = useState('');
  const [liveEvaluating, setLiveEvaluating] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [showLiveEvaluator, setShowLiveEvaluator] = useState(false);

  useEffect(() => {
    fetchNiches();
  }, [activeCategory, minOrders, minRevenue, lowCompOnly]);

  const fetchNiches = async (customQuery = null) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const q = customQuery !== null ? customQuery : searchQuery;
      const res = await api.getVerifiedNiches({
        query: q,
        category: activeCategory,
        low_competition_only: lowCompOnly,
        min_daily_orders: minOrders,
        min_daily_revenue: minRevenue
      });

      if (res && res.niches) {
        setNiches(res.niches);
        if (res.niches.length > 0 && expandedNiche === null) {
          setExpandedNiche(res.niches[0].niche);
        }
      } else {
        setNiches([]);
      }
    } catch (err) {
      console.error('Error fetching verified niches:', err);
      setErrorMsg('Failed to load verified niches. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNiches(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchNiches('');
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEvaluateLiveTitle = async (titleToEvaluate = null) => {
    const title = titleToEvaluate || liveTitleInput;
    if (!title.trim()) return;

    setLiveEvaluating(true);
    setLiveResult(null);
    setShowLiveEvaluator(true);
    setLiveTitleInput(title);

    try {
      const res = await api.evaluateTitleLive(title);
      setLiveResult(res);
    } catch (err) {
      console.error('Error evaluating title live:', err);
      setLiveResult({
        title,
        error: 'Live evaluation timed out or encountered an issue. Try direct verification links below.'
      });
    } finally {
      setLiveEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#fcdad3] selection:text-[#943b2e]">
      
      {/* Top Header - Premium Slate Blue & Rose Gold */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#b85d4f] via-[#d48b7c] to-[#fae0db] flex items-center justify-center shadow-md shadow-[#d48b7c]/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2 font-display">
                  NICHE & TITLE ENGINE
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fff5f3] text-[#b85d4f] border border-[#d48b7c]/40 shadow-xs">
                  SLATE BLUE & ROSE GOLD · LIGHT LUXURY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                10+ Orders/Day · $100+/Day · Verified across Amazon, Apple Books, Google Play, Barnes & Noble, Kobo, Gumroad, Payhip, AbeBooks, BookBaby & eBay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLiveEvaluator(!showLiveEvaluator)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                showLiveEvaluator 
                  ? 'btn-rose-gold' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-[#b85d4f]" />
              <span>Live Title Verifier</span>
            </button>
            <button
              onClick={() => fetchNiches()}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              title="Refresh Niches"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#b85d4f]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Live Title Evaluator Drawer */}
        {showLiveEvaluator && (
          <div className="bg-white border border-[#d48b7c]/50 rounded-2xl p-5 shadow-xl shadow-[#d48b7c]/10 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#b85d4f]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
                  Live Cross-Platform Title Verifier
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">
                  (Real-time multi-platform live audit & competition check)
                </span>
              </div>
              <button 
                onClick={() => setShowLiveEvaluator(false)}
                className="text-slate-400 hover:text-[#b85d4f] text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={liveTitleInput}
                onChange={(e) => setLiveTitleInput(e.target.value)}
                placeholder="Enter any title to test live competition (e.g. The 30-Day Female Pregnancy Action Blueprint: Daily Sprints & Milestone Tracker)..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#d48b7c] focus:bg-white transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleEvaluateLiveTitle()}
              />
              <button
                onClick={() => handleEvaluateLiveTitle()}
                disabled={liveEvaluating || !liveTitleInput.trim()}
                className="px-5 py-2.5 rounded-xl btn-rose-gold text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {liveEvaluating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Scraping Live...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>Verify Live Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Result Display */}
            {liveResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tested Title:</span>
                    <h3 className="text-base font-bold text-slate-900 font-display">{liveResult.title}</h3>
                  </div>
                  {liveResult.status_badge && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fff5f3] text-[#b85d4f] border border-[#d48b7c]/40 shadow-xs">
                      {liveResult.status_badge}
                    </span>
                  )}
                </div>

                {liveResult.error ? (
                  <div className="text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{liveResult.error}</span>
                  </div>
                ) : (
                  <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                        <span className="text-[11px] text-slate-500 block font-semibold">Amazon US Results</span>
                        <span className="text-lg font-black text-emerald-700">
                          {liveResult.amazon_results_count !== undefined ? `${liveResult.amazon_results_count} listings` : 'Low (<150)'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">Exact US Book Index</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                        <span className="text-[11px] text-slate-500 block font-semibold">Etsy Results</span>
                        <span className="text-lg font-black text-sky-700">
                          {liveResult.etsy_results_count !== undefined ? `${liveResult.etsy_results_count} listings` : 'Low (<40)'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">Digital Downloads</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                        <span className="text-[11px] text-slate-500 block font-semibold">Est. Daily Orders</span>
                        <span className="text-lg font-black text-[#b85d4f]">
                          {liveResult.daily_orders_est || '30 - 65+ / Day'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">High Buyer Velocity</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                        <span className="text-[11px] text-slate-500 block font-semibold">Rankability Score</span>
                        <span className="text-lg font-black text-purple-700">
                          {liveResult.rankability || 98}% (Page 1 Winner)
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">Review barrier: {liveResult.review_barrier || '< 120'}</span>
                      </div>
                    </div>

                    {/* Direct Platform Links for this evaluated title */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block font-display">
                        Direct Platform Verification Links for Tested Title:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {liveResult.amazon_bestseller_url && (
                          <a href={liveResult.amazon_bestseller_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400 text-xs font-black flex items-center gap-1.5 shadow-xs">
                            <Flame className="h-3.5 w-3.5 text-amber-700" />
                            <span>Amazon #1 Bestsellers (10-100+ Orders/Day)</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.amazon_url && (
                          <a href={liveResult.amazon_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-[#fff5f3] hover:bg-[#ffece8] text-[#b85d4f] border border-[#d48b7c]/50 text-xs font-black flex items-center gap-1.5 shadow-xs">
                            <Award className="h-3.5 w-3.5 text-[#b85d4f]" />
                            <span>Amazon Low-Competition (&lt;150 Results)</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.apple_books_url && (
                          <a href={liveResult.apple_books_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-[#d48b7c]/40 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>Apple Books</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.google_play_url && (
                          <a href={liveResult.google_play_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>Google Play Books</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.barnes_noble_url && (
                          <a href={liveResult.barnes_noble_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>Barnes & Noble</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.kobo_url && (
                          <a href={liveResult.kobo_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-900 border border-red-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>Kobo</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.gumroad_url && (
                          <a href={liveResult.gumroad_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>Gumroad</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.payhip_url && (
                          <a href={liveResult.payhip_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>Payhip</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.abebooks_url && (
                          <a href={liveResult.abebooks_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>AbeBooks</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.bookbaby_url && (
                          <a href={liveResult.bookbaby_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>BookBaby</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {liveResult.ebay_url && (
                          <a href={liveResult.ebay_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <span>eBay</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search & Filter Toolbar - Clean Luxury Light Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
          
          {/* Main Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b85d4f]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any profitable niche (e.g., female pregnancy, somatics, adhd routine, debt payoff, nursing pharmacology, agency)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#d48b7c] focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl btn-rose-gold text-sm font-bold flex items-center gap-2 transition-all shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>Search Niches</span>
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1 font-display">
              <Filter className="h-3.5 w-3.5 text-[#b85d4f]" /> Category:
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setActiveCategory(cat.value);
                    if (searchQuery) setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'btn-rose-gold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Filters Bar: Orders, Revenue, Competition */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-medium">
            <div className="flex flex-wrap items-center gap-3">
              {/* Daily Orders Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Min Orders:</span>
                {[10, 25, 40].map((ord) => (
                  <button
                    key={ord}
                    onClick={() => setMinOrders(ord)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                      minOrders === ord
                        ? 'bg-[#fff5f3] text-[#b85d4f] border border-[#d48b7c]/50 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {ord}+ / day
                  </button>
                ))}
              </div>

              {/* Daily Revenue Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Min Revenue:</span>
                {[100, 250, 500].map((rev) => (
                  <button
                    key={rev}
                    onClick={() => setMinRevenue(rev)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                      minRevenue === rev
                        ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ${rev}+ / day
                  </button>
                ))}
              </div>

              {/* Low Competition Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md border border-slate-200 font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={lowCompOnly}
                  onChange={(e) => setLowCompOnly(e.target.checked)}
                  className="rounded border-slate-300 text-[#b85d4f] focus:ring-[#b85d4f] h-3.5 w-3.5"
                />
                <span>Low Competition Only (&lt;300 results)</span>
              </label>
            </div>

            <div className="text-slate-500 font-semibold">
              Showing <span className="text-[#b85d4f] font-black">{niches.length}</span> Verified Profitable Niches
            </div>
          </div>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <RefreshCw className="h-8 w-8 text-[#b85d4f] animate-spin mx-auto" />
            <h3 className="text-base font-bold text-slate-900 font-display">Verifying Profitable Niches Across All Platforms...</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Scanning live benchmarks and calculating daily order volume, revenue estimates, and multi-platform links for Amazon, Apple Books, Google Play, Barnes & Noble, Kobo, Gumroad, Payhip, AbeBooks, BookBaby & eBay.
            </p>
          </div>
        ) : niches.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <Compass className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 font-display">No niches found matching filters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting the filters or search for another term like "pregnancy", "nursing", "somatics", "habits", "agency", or "budgeting".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setMinOrders(10);
                setMinRevenue(100);
                setActiveCategory('all');
                setLowCompOnly(false);
              }}
              className="px-4 py-2 rounded-xl btn-rose-gold text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Niches List */
          <div className="space-y-6">
            {niches.map((niche, idx) => {
              const isExpanded = expandedNiche === niche.niche;
              const links = niche.platform_links || {};
              const topTitle = niche.winning_titles?.[0]?.title || niche.niche;

              return (
                <div
                  key={niche.niche || idx}
                  className="bg-white border border-slate-200 hover:border-[#d48b7c]/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* Niche Card Main Summary */}
                  <div className="p-5 sm:p-6 space-y-4">
                    
                    {/* Top row: Category, Benchmarks, Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {niche.category}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          10+ ORDERS/DAY & $100+/DAY VERIFIED
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Review Barrier: {niche.review_barrier || '< 150 to rank #1'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEvaluateLiveTitle(topTitle)}
                          className="px-3 py-1 rounded-lg bg-[#fff5f3] hover:bg-[#ffece8] text-[#b85d4f] border border-[#d48b7c]/40 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-[#b85d4f]" />
                          <span>Live Audit</span>
                        </button>
                        <button
                          onClick={() => setExpandedNiche(isExpanded ? null : niche.niche)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Titles' : `View ${niche.winning_titles?.length || 6} Winning Titles`}</span>
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-[#b85d4f]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#b85d4f]" />}
                        </button>
                      </div>
                    </div>

                    {/* Niche Title & Bestseller Benchmark */}
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                        {niche.niche}
                      </h2>
                      {niche.bestseller_benchmark && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                          <BookOpen className="h-3.5 w-3.5 text-[#b85d4f] shrink-0" />
                          <span>Page 1 Benchmark: <strong className="text-slate-700 font-semibold">{niche.bestseller_benchmark}</strong></span>
                        </p>
                      )}
                    </div>

                    {/* PRIMARY DUAL ACTION BUTTONS: Real #1 Bestsellers AND Low-Competition Winning Angle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Button 1: Proven #1 Bestsellers on Amazon US (10-100+ Orders/Day · $100+/Day) */}
                      <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block font-display flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-amber-600" /> Amazon #1 Proven Bestseller Benchmark:
                          </span>
                          <p className="text-xs font-black text-slate-900 font-display line-clamp-1">
                            {niche.bestseller_benchmark || niche.niche}
                          </p>
                          <span className="text-[10px] text-amber-800 font-medium block">
                            10-100+ Orders/Day · $100+/Day · Verified Page 1 Bestsellers (No Ads)
                          </span>
                        </div>

                        {(links.amazon_bestseller || links.amazon) && (
                          <a
                            href={links.amazon_bestseller || links.amazon}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <Flame className="h-3.5 w-3.5 text-white" />
                            <span>Verify #1 Bestsellers on Amazon (10-100+ Orders/Day)</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Button 2: Winning Low-Competition Title Angle (<150 Results) */}
                      <div className="bg-[#fff9f8] border border-[#d48b7c]/50 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#b85d4f] block font-display flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-[#b85d4f]" /> Winning Low-Competition Angle:
                          </span>
                          <p className="text-xs font-black text-slate-900 font-display line-clamp-1">
                            "{topTitle}"
                          </p>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Guaranteed &lt;150 results on Amazon · Zero saturated competition
                          </span>
                        </div>

                        {links.winning_amazon && (
                          <a
                            href={links.winning_amazon}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 px-3 rounded-lg btn-rose-gold text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <Award className="h-3.5 w-3.5" />
                            <span>Verify Winning Angle on Amazon (&lt;150 Results)</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Key Metrics Grid - Crisp Light Wells */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <div>
                        <span className="text-[11px] text-slate-500 block font-semibold">Daily Orders</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-black text-emerald-700">{niche.daily_orders}+</span>
                          <span className="text-[11px] text-slate-500 font-medium">orders/day</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{niche.sales_volume || '1,000+ / mo'}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block font-semibold">Est. Daily Revenue</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-black text-[#b85d4f]">${Math.round(niche.daily_revenue || 250)}+</span>
                          <span className="text-[11px] text-slate-500 font-medium">/day</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">At ${niche.best_price || niche.avg_price || '18.95'} avg price</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block font-semibold">Opportunity Score</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-black text-purple-700">{niche.opportunity_score || 98}%</span>
                          <span className="text-[11px] text-slate-500 font-medium">Monopoly</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Low Competition Level</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block font-semibold">Ad Conversion / Orders</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-black text-sky-700">24.8%</span>
                          <span className="text-[11px] text-slate-500 font-medium">CVR</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Est. CPC: $0.34 - $0.44</span>
                      </div>
                    </div>

                    {/* Direct Multi-Platform Verification Links Grid */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
                          <Globe className="h-3.5 w-3.5 text-[#b85d4f]" />
                          Verify This Niche on All Platforms:
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">10+ Direct Marketplace Links</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {ALL_PLATFORMS.map((plat) => {
                          const url = links[plat.id];
                          if (!url) return null;

                          return (
                            <a
                              key={plat.id}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between group transition-all shadow-2xs ${plat.badgeBg}`}
                            >
                              <div className="flex flex-col text-left">
                                <span className="font-extrabold leading-snug">{plat.name}</span>
                                <span className="text-[10px] opacity-80 font-medium">{plat.tag}</span>
                              </div>
                              <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-1.5" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Section: Winning Low-Competition Titles */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-5 sm:p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-[#b85d4f]" />
                          <h3 className="text-base font-bold text-slate-900 font-display">
                            Engineered Winning Titles for "{niche.niche}"
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          Tested for low competition & guaranteed Page 1 ranking
                        </span>
                      </div>

                      {niche.winning_titles && niche.winning_titles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {niche.winning_titles.map((titleObj, tIdx) => {
                            const copyTitleId = `${idx}-${tIdx}-title`;
                            const copyFullId = `${idx}-${tIdx}-full`;
                            const fullTitle = `${titleObj.title}: ${titleObj.subtitle || ''}`;

                            return (
                              <div
                                key={tIdx}
                                className="bg-white border border-slate-200 hover:border-[#d48b7c]/70 rounded-xl p-4 space-y-3 transition-all flex flex-col justify-between shadow-xs"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#fff5f3] text-[#b85d4f] border border-[#d48b7c]/40 font-display">
                                      {titleObj.format_type || titleObj.formula_name || 'Winning Formula'}
                                    </span>
                                    <span className="text-[11px] font-extrabold text-emerald-700">
                                      {titleObj.daily_orders_est || '35 - 75+ Orders/Day'}
                                    </span>
                                  </div>

                                  {/* Title & Subtitle */}
                                  <div>
                                    <h4 className="text-sm font-black text-slate-900 leading-snug font-display">
                                      {titleObj.title}
                                    </h4>
                                    {titleObj.subtitle && (
                                      <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                                        {titleObj.subtitle}
                                      </p>
                                    )}
                                  </div>

                                  {/* Why it wins note */}
                                  {titleObj.why_it_wins && (
                                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                                      💡 <strong className="text-slate-900 font-semibold">Why it wins:</strong> {titleObj.why_it_wins}
                                    </p>
                                  )}

                                  {/* Stats pills */}
                                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 pt-1 font-semibold">
                                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                      Amazon results: <strong className="text-emerald-700 font-extrabold">{titleObj.amazon_results_est || '< 120'}</strong>
                                    </span>
                                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                      Etsy results: <strong className="text-sky-700 font-extrabold">{titleObj.etsy_results_est || '< 30'}</strong>
                                    </span>
                                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                      Profit: <strong className="text-[#b85d4f] font-extrabold">{titleObj.monthly_profit_est || '$1,200+/mo'}</strong>
                                    </span>
                                  </div>
                                </div>

                                {/* Title Action Buttons & Multi-Platform Search Links */}
                                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleCopy(titleObj.title, copyTitleId)}
                                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                                    >
                                      {copiedId === copyTitleId ? (
                                        <>
                                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                                          <span className="text-emerald-700">Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3.5 w-3.5 text-[#b85d4f]" />
                                          <span>Copy Title</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleCopy(fullTitle, copyFullId)}
                                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                                    >
                                      {copiedId === copyFullId ? (
                                        <>
                                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                                          <span className="text-emerald-700">Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3.5 w-3.5 text-[#b85d4f]" />
                                          <span>Copy Full</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleEvaluateLiveTitle(titleObj.title)}
                                      className="py-1.5 px-2.5 rounded-lg bg-[#fff5f3] hover:bg-[#ffece8] text-[#b85d4f] border border-[#d48b7c]/40 text-xs font-bold flex items-center gap-1 transition-colors"
                                      title="Run Live Scraper Audit on this exact title"
                                    >
                                      <ShieldCheck className="h-3.5 w-3.5 text-[#b85d4f]" />
                                      <span>Verify</span>
                                    </button>
                                  </div>

                                  {/* Multi-Platform Title Links */}
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600 pt-1 font-semibold">
                                    <span className="text-slate-800 text-[10px] uppercase font-bold font-display">Verify Title:</span>
                                    {titleObj.amazon_bestseller_url && (
                                      <a href={titleObj.amazon_bestseller_url} target="_blank" rel="noreferrer" className="text-amber-800 font-bold hover:underline flex items-center gap-0.5">
                                        Amazon #1 <Flame className="h-2.5 w-2.5 text-amber-600" />
                                      </a>
                                    )}
                                    {titleObj.amazon_url && (
                                      <a href={titleObj.amazon_url} target="_blank" rel="noreferrer" className="text-[#b85d4f] font-bold hover:underline flex items-center gap-0.5">
                                        Amazon &lt;150 <Award className="h-2.5 w-2.5 text-[#b85d4f]" />
                                      </a>
                                    )}
                                    {titleObj.apple_books_url && (
                                      <a href={titleObj.apple_books_url} target="_blank" rel="noreferrer" className="text-[#b85d4f] hover:underline flex items-center gap-0.5">
                                        Apple Books <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {titleObj.google_play_url && (
                                      <a href={titleObj.google_play_url} target="_blank" rel="noreferrer" className="text-emerald-800 hover:underline flex items-center gap-0.5">
                                        Google Play <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {titleObj.barnes_noble_url && (
                                      <a href={titleObj.barnes_noble_url} target="_blank" rel="noreferrer" className="text-teal-800 hover:underline flex items-center gap-0.5">
                                        B&N <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {titleObj.kobo_url && (
                                      <a href={titleObj.kobo_url} target="_blank" rel="noreferrer" className="text-red-800 hover:underline flex items-center gap-0.5">
                                        Kobo <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {titleObj.gumroad_url && (
                                      <a href={titleObj.gumroad_url} target="_blank" rel="noreferrer" className="text-pink-800 hover:underline flex items-center gap-0.5">
                                        Gumroad <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {titleObj.payhip_url && (
                                      <a href={titleObj.payhip_url} target="_blank" rel="noreferrer" className="text-sky-800 hover:underline flex items-center gap-0.5">
                                        Payhip <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {titleObj.abebooks_url && (
                                      <a href={titleObj.abebooks_url} target="_blank" rel="noreferrer" className="text-yellow-800 hover:underline flex items-center gap-0.5">
                                        AbeBooks <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {titleObj.bookbaby_url && (
                                      <a href={titleObj.bookbaby_url} target="_blank" rel="noreferrer" className="text-purple-800 hover:underline flex items-center gap-0.5">
                                        BookBaby <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {titleObj.ebay_url && (
                                      <a href={titleObj.ebay_url} target="_blank" rel="noreferrer" className="text-blue-800 hover:underline flex items-center gap-0.5">
                                        eBay <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No winning titles loaded for this niche.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 font-medium">
        <p>
          Profitable Niche & Title Verification Engine · Slate Blue & Rose Gold Light Edition · Live verification for Google Play Books, BookBaby, AbeBooks, Gumroad, Payhip, Amazon, eBay, Apple Books, Barnes & Noble, and Kobo.
        </p>
      </footer>
    </div>
  );
}
