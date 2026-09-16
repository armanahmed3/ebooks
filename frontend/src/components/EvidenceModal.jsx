import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Image as ImageIcon, ShieldCheck, Filter, Search } from 'lucide-react';
import { api } from '../services/api';

export default function EvidenceModal({ isOpen, onClose, projectId }) {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadEvidence();
    }
  }, [isOpen, projectId]);

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const data = await api.getEvidence(projectId);
      setEvidence(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const platforms = ['ALL', ...Array.from(new Set(evidence.map(e => e.platform)))];

  const filtered = evidence.filter(item => {
    const matchesPlat = selectedPlatform === 'ALL' || item.platform === selectedPlatform;
    const matchesSearch = !searchQuery || 
      item.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.platform?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-rose-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-rose-50/50 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-pink-600" />
              <h2 className="text-lg font-extrabold text-rose-950">Marketplace Evidence Vault</h2>
              <span className="bg-pink-100 text-pink-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {evidence.length} Records Verified
              </span>
            </div>
            <p className="text-xs text-rose-800/70 mt-0.5">
              Empirical proof archive: screenshots, observed pricing, ratings, customer complaints, and signals.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-rose-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-rose-900 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1 text-pink-500" /> Filter:
            </span>
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`text-xs px-3 py-1 rounded-xl font-bold transition-all ${
                  selectedPlatform === p
                    ? 'bg-pink-600 text-white shadow-soft'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-rose-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-rose-50/70 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* Evidence Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-20 text-center text-rose-600 font-semibold text-sm">
              Loading verified records from Evidence Vault...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-rose-800/60 text-sm">
              No evidence records found matching this filter. Run a fresh research session to collect live data.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-rose-950 border-collapse">
                <thead>
                  <tr className="border-b border-rose-200 bg-rose-50/50 text-rose-800 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Product / Signal</th>
                    <th className="py-2.5 px-3">Metric & Value</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Proof Screenshot</th>
                    <th className="py-2.5 px-3">Source Link</th>
                    <th className="py-2.5 px-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {filtered.map(item => (
                    <tr key={item.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-3 font-extrabold text-pink-700 whitespace-nowrap">
                        {item.platform}
                      </td>
                      <td className="py-3 px-3 font-semibold max-w-xs truncate" title={item.product_name}>
                        {item.product_name || 'N/A'}
                        <div className="text-[10px] text-rose-600 font-normal">{item.rank || ''}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold">{item.price}</div>
                        <div className="text-[10px] text-rose-700">★ {item.rating} ({item.review_count} revs)</div>
                        <div className="text-[10px] text-emerald-700 font-medium">{item.sales_indicator}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.source_type === 'OBSERVED' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {item.source_type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {item.screenshot_path ? (
                          <button
                            onClick={() => setActiveImage(`/${item.screenshot_path}`)}
                            className="flex items-center space-x-1 text-[11px] font-bold text-pink-600 hover:text-pink-800 hover:underline"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>View Capture</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-rose-400">No image</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {item.product_url ? (
                          <a 
                            href={item.product_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center space-x-1 text-pink-600 hover:underline"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-rose-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.confidence === 'HIGH' ? 'bg-pink-100 text-pink-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.confidence}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-rose-100 bg-rose-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-colors"
          >
            Close Vault
          </button>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4" onClick={() => setActiveImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] bg-white rounded-2xl p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveImage(null)}
              className="absolute -top-3 -right-3 bg-pink-600 text-white rounded-full p-1.5 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={activeImage} alt="Marketplace Screenshot" className="max-h-[80vh] rounded-xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
