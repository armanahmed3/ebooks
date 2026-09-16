import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, Key, CheckCircle2, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function SetupPage({ activeProject, onNextStage }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [aiTone, setAiTone] = useState('Direct, High-Utility, Action-Oriented, No-Fluff');
  const [bannedWords, setBannedWords] = useState('synergy, paradigm, guru, revolutionary, secret sauce, foolproof');
  const [writingRules, setWritingRules] = useState('1 specific person, problem first, anchor story, one finishable action, high specificity, 200-350 words per page.');
  const [storyBank, setStoryBank] = useState('Case studies of independent professionals, students, and self-starters overcoming decision fatigue and complex systems.');
  const [brandColors, setBrandColors] = useState('Primary: #EC4899 (Pink), Text: #831843, Surface: Rose-50');
  const [fonts, setFonts] = useState('Inter / Helvetica Modern Clean');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testGemini(geminiKey);
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.saveSetup({
        gemini_api_key: geminiKey,
        ai_tone: aiTone,
        banned_words: bannedWords,
        writing_rules: writingRules,
        brand_colors: brandColors,
        fonts: fonts
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-100/80 via-pink-50 to-white border border-rose-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-soft">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-rose-950">Step 1: System & AI Engine Setup</h1>
            <p className="text-xs text-rose-800/80 mt-0.5">
              Configure your Gemini AI connection, editorial tone, banned corporate jargon, and style constraints.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-5">
        
        {/* GLM-5.3 (NVIDIA Inference API) & Gemini Settings */}
        <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-rose-950 flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-pink-600" />
              <span>Primary Engine: z-ai / GLM-5.3 (NVIDIA Inference API)</span>
            </label>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>GLM-5.3 Active</span>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="NVIDIA API Key (nvapi-...)"
              value={geminiKey || "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"}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500 font-mono"
            />
            <button
              onClick={handleTestKey}
              disabled={testing}
              className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-soft transition-all cursor-pointer whitespace-nowrap"
            >
              {testing ? 'Testing...' : 'Test GLM-5.3'}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <div>
                <strong className="font-extrabold">{testResult.success ? `Connected (${testResult.model}): ` : 'Notice: '}</strong>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}
          <p className="text-[11px] text-rose-700/70">
            Engine: <code className="font-semibold text-rose-900">z-ai/glm-5.3</code> via <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900">https://integrate.api.nvidia.com/v1</code>. Reasoning and content extraction enabled across research, book forge, and toolbox.
          </p>
        </div>

        {/* AI Tone & Banned Jargon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-rose-950">AI Editorial Tone</label>
            <input
              type="text"
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500"
            />
            <p className="text-[10px] text-rose-600">Governs blueprint and book generation voice.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-rose-950">Banned Jargon & Buzzwords</label>
            <input
              type="text"
              value={bannedWords}
              onChange={(e) => setBannedWords(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500"
            />
            <p className="text-[10px] text-rose-600">These terms are strictly excluded by the prompt engine.</p>
          </div>
        </div>

        {/* Required Writing Rules */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-rose-950">7 Required Writing Rules (Book Forge)</label>
          <textarea
            rows={2}
            value={writingRules}
            onChange={(e) => setWritingRules(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Story Bank & Brand Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-rose-950">Story & Scenario Bank</label>
            <input
              type="text"
              value={storyBank}
              onChange={(e) => setStoryBank(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-rose-950">Brand Style & Color Lock</label>
            <input
              type="text"
              value={brandColors}
              onChange={(e) => setBrandColors(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-950 hover:bg-rose-50 transition-colors"
          >
            {saving ? 'Saving...' : savedSuccess ? '✓ Settings Saved' : 'Save Settings'}
          </button>

          <button
            onClick={() => onNextStage('hunter')}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-xs shadow-soft hover:from-pink-600 hover:to-rose-700 transition-all cursor-pointer"
          >
            <span>Proceed to Product Hunter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
