import React, { useState, useEffect } from 'react';
import NeuralMap from './components/NeuralMap';
import ThalassaInterface from './components/ThalassaInterface';
import MetricsPanel from './components/MetricsPanel';
import { AppMode, Page } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>(AppMode.SURFACE);
  const [page, setPage] = useState<Page>(Page.DASHBOARD);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Initial fake loading sequence
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogoMouseDown = () => {
    const timer = setTimeout(() => {
      setMode(prev => prev === AppMode.SURFACE ? AppMode.HIDDEN : AppMode.SURFACE);
    }, 2000); // 2 second hold to reveal truth
    setLongPressTimer(timer);
  };

  const handleLogoMouseUp = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  const navItems = [
    { id: Page.DASHBOARD, label: 'BRIDGE', hiddenLabel: 'CORTEX' },
    { id: Page.MAP, label: 'NAVIGATION', hiddenLabel: 'PATHWAYS' },
    { id: Page.COMMS, label: 'COMMS', hiddenLabel: 'WHISPERS' },
    { id: Page.METRICS, label: 'DIAGNOSTICS', hiddenLabel: 'SYNAPSES' },
  ];

  if (loading) {
    return (
      <div className="w-screen h-screen bg-ocean-900 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Sonar / EEG Ring Animation */}
        <div className="absolute w-[600px] h-[600px] border border-sky-500/20 rounded-full animate-ping opacity-20"></div>
        <div className="absolute w-[400px] h-[400px] border border-sky-500/30 rounded-full animate-ping opacity-30 animation-delay-500"></div>
        
        <div className="z-10 text-center">
            <h1 className="text-4xl font-bold font-sans tracking-tight text-white mb-4">KAIRO'S COMPASS</h1>
            <div className="font-mono text-sky-400 text-sm animate-pulse">
                INITIALIZING SONAR ARRAY...
            </div>
            {/* Hidden flashing text */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-8 text-[10px] text-purple-900 font-mono">
                mapping_cortical_surface.py
            </div>
        </div>
      </div>
    );
  }

  const isHidden = mode === AppMode.HIDDEN;

  return (
    <div className={`w-screen h-screen flex flex-col transition-colors duration-1000 ${isHidden ? 'bg-[#0f0518]' : 'bg-ocean-900'}`}>
      
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-700/50 flex items-center justify-between px-6 bg-ocean-900/50 backdrop-blur-md z-50 shrink-0">
        <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onMouseDown={handleLogoMouseDown}
            onMouseUp={handleLogoMouseUp}
            onTouchStart={handleLogoMouseDown}
            onTouchEnd={handleLogoMouseUp}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-700 ${isHidden ? 'bg-purple-600' : 'bg-sky-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-sans font-bold text-lg tracking-tight text-slate-100">
                {isHidden ? "Project: MENINGES" : "KAIRO'S COMPASS"}
            </h1>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider">
                {isHidden ? "NEURO-PHYSICAL MIRROR v0.9" : "ROUTE OPTIMIZATION PLATFORM"}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all duration-300 ${
                page === item.id 
                  ? (isHidden ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'bg-sky-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]') 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isHidden ? item.hiddenLabel : item.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex gap-6 text-sm font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isHidden ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`}></span>
            {isHidden ? "EARTH: DREAMING" : "SYSTEM: ONLINE"}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-4 relative">
        
        {/* DASHBOARD VIEW (Original Grid) */}
        {page === Page.DASHBOARD && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full animate-in fade-in duration-500">
            <div className="md:col-span-4 flex flex-col gap-4 overflow-hidden h-full">
                <div className="flex-1 min-h-0">
                     <ThalassaInterface mode={mode} />
                </div>
                <div className="h-1/3 min-h-[250px]">
                     <MetricsPanel mode={mode} />
                </div>
            </div>
            <div className="md:col-span-8 relative rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-none">
                     <div className="glass-panel px-3 py-1 rounded text-xs font-mono text-slate-300">
                        ZOOM: 100%
                     </div>
                     <div className="glass-panel px-3 py-1 rounded text-xs font-mono text-slate-300">
                        LAYER: {isHidden ? 'CORTICAL' : 'SURFACE'}
                     </div>
                </div>
                <NeuralMap mode={mode} />
            </div>
          </div>
        )}

        {/* MAP VIEW */}
        {page === Page.MAP && (
          <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl animate-in zoom-in-95 duration-500">
             <div className="absolute top-6 right-6 z-10 pointer-events-none">
                 <div className="glass-panel px-4 py-2 rounded text-sm font-mono text-slate-300 border-l-4 border-sky-500">
                    MODE: {isHidden ? 'GLOBAL NEURAL NETWORK' : 'FULL SCALE NAVIGATION'}
                 </div>
             </div>
             <NeuralMap mode={mode} />
          </div>
        )}

        {/* COMMS VIEW */}
        {page === Page.COMMS && (
          <div className="w-full h-full flex justify-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-full max-w-4xl h-full">
              <ThalassaInterface mode={mode} />
            </div>
          </div>
        )}

        {/* METRICS VIEW */}
        {page === Page.METRICS && (
          <div className="w-full h-full flex justify-center animate-in slide-in-from-right-4 duration-500">
            <div className="w-full max-w-5xl h-full">
              <MetricsPanel mode={mode} />
            </div>
          </div>
        )}

      </div>
      
      {/* Easter Egg Footer */}
      {isHidden && (
        <div className="fixed bottom-0 w-full text-center text-[10px] text-purple-900/50 font-mono pointer-events-none">
           "The currents aren't just water. They are thoughts."
        </div>
      )}
    </div>
  );
};

export default App;