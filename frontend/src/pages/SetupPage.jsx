import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, Key, CheckCircle2, AlertCircle, ArrowRight, Shield, Globe, Cpu, Zap, Check } from 'lucide-react';
import { api } from '../services/api';

const AI_PROVIDERS = [
  {
    id: 'pollinations',
    name: 'Pollinations Cloud AI',
    tagline: 'Zero-Config Cloud AI · 100% Free · GPT-4o, Mistral, Qwen · Keyless & Instant',
    repo: 'https://pollinations.ai',
    defaultUrl: 'https://text.pollinations.ai',
    defaultModel: 'openai',
    models: ['openai', 'mistral', 'deepseek', 'qwen'],
    requiresKey: false,
    keyPlaceholder: 'Keyless out of the box (No API Key Required)',
    badge: '100% FREE CLOUD'
  },
  {
    id: 'synthesis',
    name: 'Built-in High-Speed Synthesis Engine',
    tagline: '100% Offline & Reliable · Zero Network Wait · Master Non-Fiction Prose',
    repo: '#',
    defaultUrl: '',
    defaultModel: 'bestseller-neural-v2',
    models: ['bestseller-neural-v2', 'sprint-blueprint-v1'],
    requiresKey: false,
    keyPlaceholder: 'No API Key Required (Autonomous Engine)',
    badge: 'ZERO LATENCY'
  },
  {
    id: 'gemini',
    name: 'Google Gemini 2.5 Flash',
    tagline: 'Google AI Studio Deep Research & Multimodal Reasoning',
    repo: 'https://aistudio.google.com',
    defaultUrl: '',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'],
    requiresKey: true,
    keyPlaceholder: 'AIzaSy...',
    badge: 'GOOGLE'
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM (GLM-5.3)',
    tagline: 'Direct Enterprise Inference via NVIDIA Cloud Functions',
    repo: 'https://build.nvidia.com',
    defaultUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'z-ai/glm-5.3',
    models: ['z-ai/glm-5.3'],
    requiresKey: true,
    keyPlaceholder: 'nvapi-...',
    badge: 'REASONING'
  },
  {
    id: 'omniroute',
    name: 'OmniRoute Gateway',
    tagline: '352 Providers · 90+ Free Tiers on localhost:20128',
    repo: 'https://github.com/diegosouzapw/OmniRoute',
    defaultUrl: 'http://localhost:20128/v1',
    defaultModel: 'auto',
    models: ['auto', 'auto/coding', 'auto/fast', 'auto/cheap', 'gpt-4o-mini', 'gemini-2.0-flash'],
    requiresKey: false,
    keyPlaceholder: 'free-omniroute-token or custom',
    badge: 'LOCAL PROXY'
  },
  {
    id: 'freellmapi',
    name: 'FreeLLMAPI Router',
    tagline: '34 Free Providers · FLUX.1 [schnell] Image Gen on localhost:3001',
    repo: 'https://github.com/tashfeenahmed/freellmapi',
    defaultUrl: 'http://localhost:3001/v1',
    defaultModel: '@cf/black-forest-labs/flux-1-schnell',
    models: ['@cf/black-forest-labs/flux-1-schnell', 'gpt-4o-mini', 'deepseek-chat', 'gemini-2.0-flash', 'fusion', 'auto'],
    requiresKey: false,
    keyPlaceholder: 'freellmapi-4437a0543ea2707cc8fbc53d4e1b2df7bd52dc4f76e8d97f or unified key',
    badge: 'LOCAL GATEWAY'
  },
  {
    id: 'custom',
    name: 'Custom OpenAI / Groq / Ollama',
    tagline: 'Connect any OpenAI-compatible base URL (Groq, OpenRouter, Local Ollama)',
    repo: '#',
    defaultUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'custom'],
    requiresKey: true,
    keyPlaceholder: 'gsk_... or custom API key',
    badge: 'CUSTOM'
  }
];

export default function SetupPage({ activeProject, onNextStage }) {
  const [selectedProvider, setSelectedProvider] = useState('pollinations');
  const [baseUrl, setBaseUrl] = useState('https://text.pollinations.ai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai');

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

  // Switch provider defaults
  const handleSelectProvider = (provId) => {
    const prov = AI_PROVIDERS.find(p => p.id === provId);
    if (!prov) return;
    setSelectedProvider(prov.id);
    setBaseUrl(prov.defaultUrl);
    setModel(prov.defaultModel);
    if (prov.id === 'nvidia') {
      setApiKey(prev => prev.startsWith('nvapi-') ? prev : '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');
    } else if (prov.id === 'synthesis' || prov.id === 'pollinations') {
      setApiKey('');
    }
    setTestResult(null);
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testAI(selectedProvider, baseUrl, apiKey, model);
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message || 'Connection test failed. Ensure local router is active.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.saveSetup({
        ai_provider: selectedProvider,
        base_url: baseUrl,
        ai_api_key: apiKey,
        ai_model: model,
        gemini_api_key: apiKey,
        ai_tone: aiTone,
        banned_words: bannedWords,
        writing_rules: writingRules,
        brand_colors: brandColors,
        fonts: fonts
      });
      await api.configureAI(selectedProvider, baseUrl, apiKey, model);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const activeProvObj = AI_PROVIDERS.find(p => p.id === selectedProvider) || AI_PROVIDERS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-100/80 via-pink-50 to-white border border-rose-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-soft">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-rose-950">Step 1: Production AI Gateway & System Setup</h1>
              <p className="text-xs text-rose-800/80 mt-0.5">
                Connect your free token proxies (OmniRoute, FreeLLMAPI) or direct cloud models with automated fallover.
              </p>
            </div>
          </div>
          {savedSuccess && (
            <span className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black rounded-xl flex items-center gap-1.5 animate-bounce">
              <Check className="w-4 h-4 text-emerald-600" />
              Settings Saved!
            </span>
          )}
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-card space-y-6">
        
        {/* 1. AI Provider Selection Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-pink-600" />
              <span>Select Active AI Engine / Free Gateway:</span>
            </label>
            <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
              Active: {activeProvObj.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_PROVIDERS.map((prov) => {
              const isSelected = selectedProvider === prov.id;
              return (
                <div
                  key={prov.id}
                  onClick={() => handleSelectProvider(prov.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-pink-50/90 to-rose-50/50 border-pink-600 shadow-md shadow-pink-500/10'
                      : 'bg-white hover:bg-pink-50/30 border-rose-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-rose-950 flex items-center gap-1.5">
                        <span>{prov.name}</span>
                      </h3>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {prov.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {prov.tagline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-rose-100/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono">Model: {prov.defaultModel}</span>
                    <a
                      href={prov.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-pink-600 hover:text-pink-700 font-bold underline flex items-center gap-0.5"
                    >
                      <span>GitHub Docs</span>
                      <Globe className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Endpoint, Key, and Model Configuration */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/60 to-pink-50/30 border border-rose-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Base URL (if applicable) */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-extrabold text-rose-950 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-pink-600" />
                <span>API Endpoint URL (OpenAI-Compatible /v1)</span>
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="e.g. http://localhost:20128/v1 or http://localhost:3000/v1"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500 font-mono text-slate-800"
              />
              <p className="text-[10px] text-slate-500">
                OmniRoute runs on <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900">localhost:20128</code>. FreeLLMAPI runs on <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900">localhost:3001</code>.
              </p>
            </div>

            {/* Model Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-rose-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                <span>Target Model</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500 font-bold text-slate-800 cursor-pointer"
              >
                {activeProvObj.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500">
                '{activeProvObj.defaultModel}' handles auto-routing.
              </p>
            </div>
          </div>

          {/* API Key Input & Test Button */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-rose-950 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-pink-600" />
              <span>API Key / Gateway Token ({activeProvObj.requiresKey ? 'Required' : 'Optional for zero-config local routers'})</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={activeProvObj.keyPlaceholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500 font-mono text-slate-800"
              />
              <button
                onClick={handleTestKey}
                disabled={testing}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-600/20 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>{testing ? 'Pinging Gateway...' : `Test ${activeProvObj.name.split(' ')[0]}`}</span>
              </button>
            </div>
          </div>

          {/* Connection Feedback Result */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2.5 transition-all ${
              testResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <strong className="font-extrabold">
                    {testResult.success ? `Connected (${testResult.provider || activeProvObj.name}): ` : 'Connection Notice: '}
                  </strong>
                  {testResult.latency_ms && (
                    <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 font-black text-[10px] rounded-md">
                      {testResult.latency_ms}ms
                    </span>
                  )}
                </div>
                <span className="block mt-0.5 text-[11px] opacity-90">{testResult.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. AI Editorial Tone & Style Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-rose-950">Core Editorial Rules</label>
          <textarea
            rows={2}
            value={writingRules}
            onChange={(e) => setWritingRules(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500 resize-none"
          />
          <p className="text-[10px] text-rose-600">Enforced across every section and blueprint generation prompt.</p>
        </div>

        {/* Action Button Bar */}
        <div className="pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-600/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Shield className="w-4 h-4 text-yellow-300" />
            <span>{saving ? 'Saving System Configuration...' : 'Save AI Configuration'}</span>
          </button>

          {onNextStage && (
            <button
              onClick={() => onNextStage('hunter')}
              className="w-full sm:w-auto px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Proceed to Bestseller Hunter</span>
              <ArrowRight className="w-4 h-4 text-pink-600" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
