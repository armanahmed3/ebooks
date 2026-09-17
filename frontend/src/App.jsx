import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WizardRail from './components/WizardRail';
import EvidenceModal from './components/EvidenceModal';
import ToolboxModal from './components/ToolboxModal';

import SetupPage from './pages/SetupPage';
import ProductHunterPage from './pages/ProductHunterPage';
import WinnerDeepDivePage from './pages/WinnerDeepDivePage';
import BlueprintPage from './pages/BlueprintPage';
import BookForgePage from './pages/BookForgePage';
import ListingsPage from './pages/ListingsPage';
import OutreachPage from './pages/OutreachPage';
import DashboardPage from './pages/DashboardPage';
import BestsellerWizard from './components/BestsellerWizard';

import { api } from './services/api';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [currentTab, setCurrentTab] = useState('wizard');
  
  // Modals
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [toolboxTab, setToolboxTab] = useState('coach');
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjNiche, setNewProjNiche] = useState('');

  useEffect(() => {
    initProjects();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      loadProjectDetails(activeProjectId);
    }
  }, [activeProjectId, currentTab]);

  const initProjects = async () => {
    try {
      let projs = await api.getProjects();
      if (!projs || projs.length === 0) {
        // Create initial default project
        const initial = await api.createProject(
          'Productivity Master System',
          'Digital Planners & Productivity Systems'
        );
        projs = [initial];
      }
      setProjects(projs);
      setActiveProjectId(projs[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProjectDetails = async (id) => {
    try {
      const proj = await api.getProject(id);
      setActiveProject(proj);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjNiche.trim()) return;
    try {
      const p = await api.createProject(newProjName, newProjNiche);
      setProjects([p, ...projects]);
      setActiveProjectId(p.id);
      setIsNewProjectOpen(false);
      setNewProjName('');
      setNewProjNiche('');
      setCurrentTab('hunter');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLockWinner = async (candidateId) => {
    await loadProjectDetails(activeProjectId);
    setCurrentTab('winner');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-white text-slate-800 flex flex-col font-sans selection:bg-pink-200 selection:text-pink-900">
      
      {/* Top Navigation */}
      <Navbar
        activeProject={activeProject}
        projects={projects}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenToolbox={(tab = 'coach') => {
          setToolboxTab(tab);
          setIsToolboxOpen(true);
        }}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
      />

      {/* Permanent Wizard Stage Rail */}
      <WizardRail
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
        activeProject={activeProject}
      />

      {/* Main App Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'wizard' && (
          <BestsellerWizard
            activeProject={activeProject}
            onRefreshProject={() => activeProjectId && loadProjectDetails(activeProjectId)}
            onSwitchToAdvanced={() => setCurrentTab('hunter')}
          />
        )}

        {currentTab === 'setup' && (
          <SetupPage
            activeProject={activeProject}
            onNextStage={(next) => setCurrentTab(next)}
          />
        )}

        {currentTab === 'hunter' && (
          <ProductHunterPage
            activeProject={activeProject}
            onLockWinner={handleLockWinner}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onRefreshProject={() => activeProjectId && loadProjectDetails(activeProjectId)}
          />
        )}

        {currentTab === 'winner' && (
          <WinnerDeepDivePage
            activeProject={activeProject}
            onNextStage={(next) => setCurrentTab(next)}
          />
        )}

        {currentTab === 'blueprint' && (
          <BlueprintPage
            activeProject={activeProject}
            onNextStage={(next) => setCurrentTab(next)}
          />
        )}

        {currentTab === 'forge' && (
          <BookForgePage
            activeProject={activeProject}
            onNextStage={(next) => setCurrentTab(next)}
          />
        )}

        {currentTab === 'listings' && (
          <ListingsPage
            activeProject={activeProject}
            onNextStage={(next) => setCurrentTab(next)}
          />
        )}

        {currentTab === 'outreach' && (
          <OutreachPage
            activeProject={activeProject}
            onNextStage={(next) => setCurrentTab(next)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            activeProject={activeProject}
            onChangeTab={(tab) => setCurrentTab(tab)}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
          />
        )}
      </main>

      {/* Evidence Vault Modal */}
      <EvidenceModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        projectId={activeProjectId}
      />

      {/* Toolbox 11-Tool Modal */}
      <ToolboxModal
        isOpen={isToolboxOpen}
        onClose={() => setIsToolboxOpen(false)}
        initialTab={toolboxTab}
        activeProject={activeProject}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
      />

      {/* New Project Modal */}
      {isNewProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100 space-y-4">
            <h3 className="text-base font-extrabold text-rose-950">Create New Intelligence Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-rose-950 block mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. ADHD Productivity System"
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500 font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-rose-950 block mb-1">Target Niche</label>
                <input
                  type="text"
                  placeholder="e.g. Minimalist Student Planners"
                  value={newProjNiche}
                  onChange={e => setNewProjNiche(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:border-pink-500 font-semibold"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-soft transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
