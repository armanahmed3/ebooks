import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Play, Pause, RefreshCw, FileDown, CheckCircle2, 
  Layers, ArrowRight, Image as ImageIcon, Sparkles, Copy, Check, Upload, Edit3, Save
} from 'lucide-react';
import { api } from '../services/api';

export default function BookForgePage({ activeProject, onNextStage }) {
  const [ledger, setLedger] = useState({ total_pages: 110, completed_pages: 0, total_words: 0, pages: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPageNum, setSelectedPageNum] = useState(1);
  const [pdfBuilding, setPdfBuilding] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState(null);
  
  // Visual Studio states
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editingPromptText, setEditingPromptText] = useState('');

  useEffect(() => {
    if (activeProject?.id) {
      loadLedger();
    }
  }, [activeProject]);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const data = await api.getLedger(activeProject.id);
      setLedger(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteBatch = async (start = 1, end = 10) => {
    if (!activeProject?.id) return;
    setGenerating(true);
    try {
      await api.generateBatch(activeProject.id, start, end);
      await loadLedger();
      setSelectedPageNum(start);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyPrompt = (promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleImageUpload = async (e, pageNumber) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject?.id) return;
    setUploadingImage(true);
    try {
      await api.uploadPageImage(activeProject.id, pageNumber, file);
      await loadLedger();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePrompt = async (pageNumber) => {
    if (!activeProject?.id) return;
    try {
      await api.updatePage(activeProject.id, pageNumber, { image_prompt: editingPromptText });
      setIsEditingPrompt(false);
      await loadLedger();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuildPdf = async () => {
    if (!activeProject?.id) return;
    setPdfBuilding(true);
    setPdfDownloadUrl(null);
    try {
      const res = await api.buildPdf(activeProject.id);
      if (res.download_url) {
        setPdfDownloadUrl(res.download_url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPdfBuilding(false);
    }
  };

  const selectedPage = ledger.pages?.find(p => p.page_number === selectedPageNum) || ledger.pages?.[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-100/80 via-pink-50 to-white border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-soft">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-rose-950">Step 5: Book Forge & ReportLab 6×9 PDF Engine</h1>
            <p className="text-xs text-rose-800/80 mt-0.5">
              Generates 200–350 words per page strictly following the 7 writing rules with auto-resume state preservation.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNextStage('listings')}
          className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-soft rounded-2xl transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Continue to Step 6 Listings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Ledger Tracker & Forge Controls */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100">
          <div>
            <span className="text-[10px] font-bold text-pink-600 uppercase">PAGE LEDGER</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-rose-950">
                {ledger.completed_pages || 0}
              </span>
              <span className="text-sm font-bold text-rose-600">/ 110 Pages Complete</span>
              <span className="text-xs text-rose-700 ml-2 font-medium">({ledger.total_words || 0} words written)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleWriteBatch(1, 10)}
              disabled={generating}
              className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all cursor-pointer flex items-center space-x-1.5"
            >
              {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>WRITE FIRST 10</span>
            </button>

            <button
              onClick={() => handleWriteBatch(11, 25)}
              disabled={generating}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>WRITE NEXT BATCH</span>
            </button>

            <button
              onClick={handleBuildPdf}
              disabled={pdfBuilding}
              className="px-5 py-2.5 bg-rose-950 hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow-soft transition-all cursor-pointer flex items-center space-x-1.5"
            >
              {pdfBuilding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              <span>BUILD MY BOOK PDF</span>
            </button>
          </div>
        </div>

        {/* PDF Download Alert */}
        {pdfDownloadUrl && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Publication-Ready 6×9 Inch PDF Compiled Successfully!</span>
            </div>
            <a
              href={pdfDownloadUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Download PDF Book
            </a>
          </div>
        )}

        {/* Page Grid & Active Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          
          {/* Page Selector Grid */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="font-extrabold text-xs text-rose-950">Book Navigation Matrix</h3>
            <div className="grid grid-cols-5 gap-1.5 max-h-96 overflow-y-auto p-1.5 border border-rose-100 rounded-2xl bg-rose-50/30">
              {ledger.pages?.map(p => {
                const isSelected = p.page_number === selectedPageNum;
                const isDone = p.status === 'complete';
                return (
                  <button
                    key={p.page_number}
                    onClick={() => setSelectedPageNum(p.page_number)}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-pink-600 text-white shadow-soft font-black'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-white text-rose-800 hover:bg-rose-100 border border-rose-100'
                    }`}
                  >
                    {p.page_number}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Page Preview Content */}
          <div className="lg:col-span-2 space-y-4">
            {selectedPage ? (
              <div className="p-5 rounded-2xl border border-rose-200 bg-white space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <div>
                    <span className="text-[10px] font-bold text-pink-600 uppercase">PAGE {selectedPage.page_number} OF 110</span>
                    <h3 className="font-extrabold text-base text-rose-950 mt-0.5">{selectedPage.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      selectedPage.status === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedPage.word_count || 0} Words
                    </span>
                  </div>
                </div>

                <div className="text-xs text-rose-950 leading-relaxed whitespace-pre-line font-medium min-h-48 bg-rose-50/30 p-4 rounded-xl border border-rose-100/60">
                  {selectedPage.content || (
                    <span className="text-rose-400 italic">
                      This page has not been drafted yet. Click "Write First 10" or "Write Next Batch" to generate high-utility text satisfying the 7 rules.
                    </span>
                  )}
                </div>

                {/* Visual Architecture & Diagram Frame for EVERY Page */}
                <div className="p-4 bg-gradient-to-br from-pink-50/80 via-rose-50/40 to-white rounded-2xl border-2 border-dashed border-pink-300 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-pink-600" />
                      <span className="text-[10px] font-black uppercase text-pink-800 tracking-wider">
                        PAGE {selectedPage.page_number} VISUAL ARCHITECTURE & GEMINI IMAGE PROMPT
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyPrompt(selectedPage.image_prompt || `Minimalist diagram illustrating ${selectedPage.title}`)}
                        className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                        title="Copy exact prompt to generate with Gemini or Midjourney"
                      >
                        {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPrompt ? 'Copied Prompt ✓' : 'Copy Prompt for Gemini'}</span>
                      </button>

                      <label className="flex items-center space-x-1 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Generated Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, selectedPage.page_number)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Render Uploaded Image Preview if available */}
                  {selectedPage.image_path ? (
                    <div className="p-2 bg-white rounded-xl border border-pink-200 flex flex-col items-center">
                      <img 
                        src={`/assets/${activeProject?.id}/page_${selectedPage.page_number}.png?t=${Date.now()}`} 
                        alt={`Visual illustration for page ${selectedPage.page_number}`}
                        className="max-h-48 object-contain rounded-lg shadow-sm"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="text-[10px] text-emerald-700 font-bold mt-1">✓ Custom Generated Image Loaded for Page {selectedPage.page_number}</span>
                    </div>
                  ) : null}

                  {/* AI Image Prompt Box */}
                  <div className="p-3 bg-white rounded-xl border border-pink-100 text-xs space-y-1 shadow-xs">
                    {isEditingPrompt ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingPromptText}
                          onChange={(e) => setEditingPromptText(e.target.value)}
                          className="w-full p-2 text-xs border border-pink-300 rounded-lg focus:outline-none focus:border-pink-500 font-medium"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setIsEditingPrompt(false)}
                            className="px-3 py-1 text-xs text-rose-700 hover:bg-rose-50 rounded-lg font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSavePrompt(selectedPage.page_number)}
                            className="px-3 py-1 text-xs bg-pink-600 text-white rounded-lg font-bold flex items-center space-x-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Prompt</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-pink-700 font-bold block mb-0.5">Prompt for Gemini / Midjourney:</strong>
                          <p className="text-rose-950 italic font-medium leading-relaxed">
                            "{selectedPage.image_prompt || `Minimalist diagram illustrating ${selectedPage.title} framework and actionable checklist.`}"
                          </p>
                          <span className="inline-block mt-1 text-[10px] text-rose-600 font-semibold">
                            Format: 300 DPI high-contrast vector line diagram, black & deep rose accents, publication-grade.
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingPromptText(selectedPage.image_prompt || '');
                            setIsEditingPrompt(true);
                          }}
                          className="text-pink-500 hover:text-pink-700 p-1 rounded-md"
                          title="Edit prompt"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-rose-600">Select a page to view content.</div>
            )}
          </div>

        </div>

      </div>

      {/* Cover Studio Card */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-4">
        <h2 className="font-extrabold text-base text-rose-950">Cover Studio (2 Concepts & Marketplace Reference Hunting)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2">
            <span className="text-[10px] font-bold text-pink-600 uppercase">CONCEPT 1 • MODERN MINIMALIST (1:1 & 1600×2560)</span>
            <div className="aspect-square bg-gradient-to-br from-rose-950 to-pink-900 rounded-xl p-6 flex flex-col justify-between text-white shadow-soft">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-pink-300 uppercase">THE COMPLETE ACTION BLUEPRINT</span>
                <h3 className="text-lg font-black tracking-tight mt-1">{activeProject?.locked_winner?.title || 'THE MASTER GUIDE'}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-medium text-pink-200">EMPIRE OS EDITION</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2">
            <span className="text-[10px] font-bold text-pink-600 uppercase">CONCEPT 2 • HIGH CONTRAST WORKBOOK</span>
            <div className="aspect-square bg-gradient-to-br from-white to-rose-100 border-2 border-rose-950 rounded-xl p-6 flex flex-col justify-between text-rose-950 shadow-soft">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-pink-600 uppercase">PRINTABLE 30-DAY PROTOCOL</span>
                <h3 className="text-lg font-black tracking-tight mt-1">{activeProject?.locked_winner?.title || 'THE ACTION MANUAL'}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-rose-700">INCLUDES 15 TEMPLATES</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
