import React from 'react';
import { 
  Crown, 
  Box, 
  Dices, 
  Target, 
  Brain, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight, 
  Award,
  Zap
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useUserStore } from '../../store/useUserStore';
import { HUBS_DATA } from '../../data/gamesCatalog';
import { HubCategory } from '../../types/game';

export const Sidebar: React.FC = () => {
  const { activeHub, setActiveHub, sidebarCollapsed, toggleSidebar, currentView, setCurrentView } = useGameStore();
  const { openProgressionModal } = useUserStore();

  const getHubIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Crown className="w-4 h-4" />;
      case 'Box': return <Box className="w-4 h-4" />;
      case 'Dices': return <Dices className="w-4 h-4" />;
      case 'Target': return <Target className="w-4 h-4" />;
      case 'Brain': return <Brain className="w-4 h-4" />;
      default: return <LayoutGrid className="w-4 h-4" />;
    }
  };

  const handleSelectHub = (hubId: HubCategory | 'all') => {
    setActiveHub(hubId);
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
  };

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] border-r border-cyber-border bg-cyber-card/60 backdrop-blur-md flex flex-col justify-between transition-all duration-300 z-20 select-none flex-shrink-0 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Upper Navigation */}
      <div className="p-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {/* All Games Button */}
        <div>
          <button
            onClick={() => handleSelectHub('all')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
              activeHub === 'all'
                ? 'bg-cyber-accent text-cyber-dark font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-cyber-border/40'
            }`}
            title="All 45 Games"
          >
            <LayoutGrid className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>All Games Arena</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  activeHub === 'all' ? 'bg-cyber-dark/40 text-cyber-dark font-black' : 'bg-cyber-border text-slate-400'
                }`}>
                  45
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Categories Section */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
              GAME HUBS
            </div>
          )}

          {HUBS_DATA.map((hub) => {
            const isActive = activeHub === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => handleSelectHub(hub.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyber-border to-cyber-border/60 text-cyber-accent border border-cyber-accent/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-cyber-border/30'
                }`}
                title={hub.title}
              >
                <div className={`${isActive ? 'text-cyber-accent' : 'text-slate-400'}`}>
                  {getHubIcon(hub.iconName)}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full text-left truncate">
                    <span className="truncate">{hub.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-dark text-slate-400 border border-cyber-border ml-1 flex-shrink-0">
                      {hub.gameCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Dual Progression Quick Access */}
        <div className="pt-2 border-t border-cyber-border/60">
          {!sidebarCollapsed && (
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
              LEAGUE & RANKS
            </div>
          )}

          <button
            onClick={() => openProgressionModal('pvp')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-all"
            title="Global PvP Rankings"
          >
            <Award className="w-4 h-4 text-cyber-gold flex-shrink-0" />
            {!sidebarCollapsed && <span>PvP League (ELO)</span>}
          </button>

          <button
            onClick={() => openProgressionModal('bot')}
            className="w-full mt-1.5 flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 transition-all"
            title="Bot Mastery Track"
          >
            <Zap className="w-4 h-4 text-cyber-neon flex-shrink-0" />
            {!sidebarCollapsed && <span>Bot Mastery (XP)</span>}
          </button>
        </div>
      </div>

      {/* Collapse/Expand Toggle Footer */}
      <div className="p-3 border-t border-cyber-border flex items-center justify-between">
        {!sidebarCollapsed && (
          <span className="text-[11px] font-mono text-slate-500">v1.0 • PWA Ready</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg bg-cyber-border/40 hover:bg-cyber-accent/20 hover:text-cyber-accent text-slate-400 transition-all ml-auto"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
