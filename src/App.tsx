import React from 'react';
import { LandscapeGuard } from './components/layout/LandscapeGuard';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GameDiscovery } from './components/catalog/GameDiscovery';
import { GameViewport } from './components/viewport/GameViewport';
import { ProgressionModal } from './components/progression/ProgressionModal';
import { useGameStore } from './store/useGameStore';

export const App: React.FC = () => {
  const { currentView } = useGameStore();

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-cyber-dark text-slate-100 select-none">
      {/* 1. Strict Landscape Orientation Guard */}
      <LandscapeGuard />

      {/* 2. Top Gamer HUD Header */}
      <Header />

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Hub Sidebar (Hidden when inside active game for edge-to-edge immersion) */}
        {currentView === 'catalog' && <Sidebar />}

        {/* View Switcher */}
        {currentView === 'catalog' ? <GameDiscovery /> : <GameViewport />}
      </div>

      {/* 4. Dual Progression Modal */}
      <ProgressionModal />
    </div>
  );
};

export default App;
