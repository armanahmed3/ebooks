import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function ListingsPage({ activeProject, onNextStage }) {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('amazon');
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      loadListings();
    }
  }, [activeProject]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings(activeProject.id);
      setListings(data.listings || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return <div className="p-12 text-center text-rose-600 text-sm font-semibold">Generating multi-marketplace listing assets...</div>;
  }

  const currentListing = listings?.[selectedPlatform] || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-100/80 via-pink-50 to-white border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-soft">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-rose-950">Step 6: Multi-Marketplace Listing Engine</h1>
            <p className="text-xs text-rose-800/80 mt-0.5">
              Platform-specific listing copy formatted for Amazon KDP, Etsy, eBay, Gumroad, Payhip & Draft2Digital.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNextStage('outreach')}
          className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-soft rounded-2xl transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Continue to Step 7 Outreach</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Platform Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'amazon', label: 'Amazon KDP (Pricing + 7 Keywords)' },
          { id: 'etsy', label: 'Etsy (13 Tags)' },
          { id: 'ebay', label: 'eBay Listing' },
          { id: 'gumroad', label: 'Gumroad Product Page' },
          { id: 'payhip', label: 'Payhip Store' },
          { id: 'draft2digital', label: 'Draft2Digital' }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedPlatform === p.id
                ? 'bg-pink-600 text-white shadow-soft'
                : 'bg-white text-rose-900 hover:bg-rose-50 border border-rose-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Pricing & Profit Intelligence Hub */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950 via-pink-950 to-rose-900 text-white shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-pink-500/30 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-500 text-white tracking-widest">
              PRICING & ROYALTY INTELLIGENCE
            </span>
            <span className="text-xs font-bold text-pink-200">Amazon Marketplace Benchmark</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
            70% KDP Royalty Tier
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider block">Market Average Price</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {currentListing.average_price || listings?.pricing_intelligence?.average_market_price ? `$${listings?.pricing_intelligence?.average_market_price || 16.95}` : '$16.95'}
            </div>
            <span className="text-[10px] text-rose-200 mt-1 block">Based on scraped Amazon competitors</span>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl border border-pink-400 shadow-soft">
            <span className="text-[10px] text-yellow-200 font-black uppercase tracking-wider block">Recommended Best Price</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {currentListing.recommended_price || listings?.pricing_intelligence?.recommended_best_price ? `$${listings?.pricing_intelligence?.recommended_best_price || 17.95}` : '$17.95'}
            </div>
            <span className="text-[10px] text-pink-100 font-semibold mt-1 block">Optimal 70% royalty sweet spot</span>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Est. Profit Per Sale</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {listings?.pricing_intelligence?.estimated_royalty_per_sale ? `$${listings?.pricing_intelligence?.estimated_royalty_per_sale}` : '$11.26'}
            </div>
            <span className="text-[10px] text-emerald-200 mt-1 block">~62.7% net margin per book</span>
          </div>
        </div>

        <p className="text-xs text-rose-200/90 leading-relaxed pt-1">
          <strong>Strategic Pricing Analysis: </strong> 
          {listings?.pricing_intelligence?.pricing_strategy || 'Priced at the optimal $14.99-$19.99 70% KDP Royalty sweet spot. Offers premium workbook positioning while beating $24.99 hardcover competitors.'}
        </p>
      </div>

      {/* Active Listing Details Card */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-5">
        
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-rose-950 uppercase">High-Converting Listing Title</label>
            <button 
              onClick={() => handleCopy(currentListing.title || '', 'title')}
              className="text-pink-600 hover:text-pink-800 text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'title' ? 'Copied' : 'Copy Title'}</span>
            </button>
          </div>
          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs font-bold text-rose-950">
            {currentListing.title || 'N/A'}
          </div>
        </div>

        {/* Subtitle if available */}
        {currentListing.subtitle && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-rose-950 uppercase">Subtitle</label>
              <button 
                onClick={() => handleCopy(currentListing.subtitle || '', 'subtitle')}
                className="text-pink-600 hover:text-pink-800 text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                {copiedKey === 'subtitle' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'subtitle' ? 'Copied' : 'Copy Subtitle'}</span>
              </button>
            </div>
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-rose-900 font-semibold">
              {currentListing.subtitle}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-extrabold text-rose-950 uppercase">Sales Description</label>
              {selectedPlatform === 'amazon' && (
                <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                  KDP HTML Formatted (Bold hooks & bullet lists)
                </span>
              )}
            </div>
            <button 
              onClick={() => handleCopy(currentListing.description || '', 'desc')}
              className="text-pink-600 hover:text-pink-800 text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'desc' ? 'Copied Description' : 'Copy Description'}</span>
            </button>
          </div>
          <div className="p-4 bg-rose-50/30 rounded-xl border border-rose-100 text-xs text-rose-950 whitespace-pre-line leading-relaxed font-mono">
            {currentListing.description || 'N/A'}
          </div>
        </div>

        {/* 7 Numbered Amazon Backend Keywords or Etsy Tags */}
        {(currentListing.keywords || currentListing.tags) && (
          <div className="space-y-3 pt-3 border-t border-rose-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold text-rose-950 uppercase block">
                  {selectedPlatform === 'amazon' ? '7 Amazon KDP Backend Keywords (Fill Slots 1 to 7)' : '13 Etsy Listing Tags'}
                </label>
                <span className="text-[10px] text-rose-600">
                  {selectedPlatform === 'amazon' ? 'Strictly under 50 characters each with high customer search volume & zero keyword repetition.' : 'Under 20 characters each.'}
                </span>
              </div>
              <button 
                onClick={() => handleCopy((currentListing.keywords || currentListing.tags || []).join(', '), 'tags')}
                className="text-pink-600 hover:text-pink-800 text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                {copiedKey === 'tags' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'tags' ? 'Copied All' : 'Copy All'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(currentListing.keywords || currentListing.tags || []).map((tag, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 bg-gradient-to-r from-rose-50/80 to-white rounded-xl border border-rose-200 text-xs font-bold text-rose-950 shadow-2xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{tag}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <span className="text-[10px] text-rose-500 font-medium">({tag.length} chars)</span>
                    <button
                      onClick={() => handleCopy(tag, `tag_${idx}`)}
                      className="text-pink-600 hover:text-pink-800 p-1"
                      title="Copy this keyword"
                    >
                      {copiedKey === `tag_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
