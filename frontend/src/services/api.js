const API_BASE = '/api';

export const api = {
  // Health & Setup
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
  async testAI(provider = 'omniroute', baseUrl = null, apiKey = null, model = null) {
    const res = await fetch(`${API_BASE}/setup/test-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        base_url: baseUrl,
        api_key: apiKey,
        model
      })
    });
    return res.json();
  },
  async testGemini(gemini_api_key) {
    const res = await fetch(`${API_BASE}/setup/test-gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemini_api_key })
    });
    return res.json();
  },
  async saveSetup(settings) {
    const res = await fetch(`${API_BASE}/setup/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },
  async createProject(name, niche) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, niche })
    });
    return res.json();
  },
  async getProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`);
    return res.json();
  },
  async updateStage(projectId, stage) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage })
    });
    return res.json();
  },
  async exportProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/export`);
    return res.json();
  },

  // Research
  async startResearch(projectId, niche, mode = 'standard') {
    const res = await fetch(`${API_BASE}/research/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, niche, mode })
    });
    return res.json();
  },
  async startAutopilot(projectId, niche) {
    const res = await fetch(`${API_BASE}/research/autonomous-autopilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, niche })
    });
    return res.json();
  },
  async getResearchStatus(sessionId) {
    const res = await fetch(`${API_BASE}/research/status/${sessionId}`);
    return res.json();
  },
  async getEvidence(projectId) {
    const res = await fetch(`${API_BASE}/research/evidence/${projectId}`);
    return res.json();
  },
  async discoverIdeas(query = '', low_competition_only = false) {
    const res = await fetch(`${API_BASE}/research/discover-ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, low_competition_only })
    });
    return res.json();
  },
  async forgeFromBestseller(payload) {
    const res = await fetch(`${API_BASE}/research/forge-from-bestseller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async getWinningTitles(niche, category = null) {
    const res = await fetch(`${API_BASE}/research/winning-titles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche, category })
    });
    return res.json();
  },
  async getVerifiedNiches(params = {}) {
    const res = await fetch(`${API_BASE}/niches/verified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query || '',
        category: params.category || 'all',
        low_competition_only: Boolean(params.low_competition_only),
        min_daily_orders: params.min_daily_orders !== undefined ? params.min_daily_orders : 10,
        min_daily_revenue: params.min_daily_revenue !== undefined ? params.min_daily_revenue : 100.0
      })
    });
    return res.json();
  },
  async evaluateTitleLive(title, session_id = 'live_title') {
    const res = await fetch(`${API_BASE}/research/evaluate-title-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, session_id })
    });
    return res.json();
  },

  // Candidates
  async getCandidates(projectId) {
    const res = await fetch(`${API_BASE}/candidates/${projectId}`);
    return res.json();
  },
  async clearCandidates(projectId) {
    const res = await fetch(`${API_BASE}/candidates/${projectId}/clear`, { method: 'POST' });
    return res.json();
  },
  async lockCandidate(candidateId) {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}/lock`, { method: 'POST' });
    return res.json();
  },

  // Blueprint
  async getBlueprint(projectId) {
    const res = await fetch(`${API_BASE}/blueprint/${projectId}`);
    return res.json();
  },
  async generateCover(projectId, niche, title, subtitle = '', stylePattern = 'minimalist_luxury') {
    const res = await fetch(`${API_BASE}/blueprint/generate-cover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        niche,
        title,
        subtitle,
        style_pattern: stylePattern
      })
    });
    return res.json();
  },
  async configureAI(provider, baseUrl = null, apiKey = null, model = null) {
    const res = await fetch(`${API_BASE}/setup/configure-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        base_url: baseUrl,
        api_key: apiKey,
        model
      })
    });
    return res.json();
  },
  async testImageEngine() {
    const res = await fetch(`${API_BASE}/setup/test-image-engine`);
    return res.json();
  },
  async testAI(provider, baseUrl = null, apiKey = null, model = null) {
    const res = await fetch(`${API_BASE}/setup/test-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        base_url: baseUrl,
        api_key: apiKey,
        model
      })
    });
    return res.json();
  },

  // Book Forge & PDF
  async getLedger(projectId) {
    const res = await fetch(`${API_BASE}/book/ledger/${projectId}`);
    return res.json();
  },
  async generateBatch(projectId, startPage = 1, endPage = 10) {
    const res = await fetch(`${API_BASE}/book/generate-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, start_page: startPage, end_page: endPage })
    });
    return res.json();
  },
  async buildPdf(projectId) {
    const res = await fetch(`${API_BASE}/book/build-pdf?project_id=${projectId}`, { method: 'POST' });
    return res.json();
  },
  async uploadPageImage(projectId, pageNumber, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/book/page-image/${projectId}/${pageNumber}`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  async updatePage(projectId, pageNumber, data) {
    const res = await fetch(`${API_BASE}/book/page/${projectId}/${pageNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Listings
  async getListings(projectId) {
    const res = await fetch(`${API_BASE}/listings/${projectId}`);
    return res.json();
  },

  // Outreach & Excel
  async getOutreach(projectId) {
    const res = await fetch(`${API_BASE}/outreach/${projectId}`);
    return res.json();
  },
  getDownloadPdfUrl(projectId) {
    return `${API_BASE}/book/download-pdf/${projectId}`;
  },
  getDownloadExcelUrl(projectId) {
    return `${API_BASE}/outreach/download-excel/${projectId}`;
  },

  // Toolbox
  async checkSpam(text) {
    const res = await fetch(`${API_BASE}/toolbox/spam-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },
  async getGhostwriter(title, niche) {
    const res = await fetch(`${API_BASE}/toolbox/ghostwriter?title=${encodeURIComponent(title)}&niche=${encodeURIComponent(niche)}`);
    return res.json();
  },
  async getDistributionRadar(niche) {
    const res = await fetch(`${API_BASE}/toolbox/distribution-radar?niche=${encodeURIComponent(niche)}`);
    return res.json();
  },
  async getPricingLab(basePrice = 19.99) {
    const res = await fetch(`${API_BASE}/toolbox/pricing-lab?base_price=${basePrice}`);
    return res.json();
  },
  async getProductDoctor(issueType = 'no_sales') {
    const res = await fetch(`${API_BASE}/toolbox/product-doctor?issue_type=${issueType}`);
    return res.json();
  },
  async getCoach(stage = 'DISCOVER') {
    const res = await fetch(`${API_BASE}/toolbox/coach?stage=${stage}`);
    return res.json();
  },
  async getMoneyDashboard(projectId) {
    const res = await fetch(`${API_BASE}/toolbox/money-dashboard/${projectId}`);
    return res.json();
  },
  async addRevenueEntry(entry) {
    const res = await fetch(`${API_BASE}/toolbox/money-dashboard/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.json();
  }
};
