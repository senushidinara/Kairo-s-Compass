import React, { useState, useEffect } from 'react';
import NeuralMap from './components/NeuralMap';
import ThalassaInterface from './components/ThalassaInterface';
import MetricsPanel from './components/MetricsPanel';
import { AppMode, Page } from './types';
import { SHIPS_DATA, ROUTES, PORTS } from './constants';

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
        
        {/* DASHBOARD VIEW - ORGANIZED GRID */}
        {page === Page.DASHBOARD && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-in fade-in duration-500 overflow-hidden">
            
            {/* Col 1: AI & Comms */}
            <div className="flex flex-col gap-4 h-full min-h-0">
               <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-2 shrink-0">
                  <h2 className={`text-sm font-mono font-bold ${isHidden ? 'text-purple-400' : 'text-sky-400'}`}>
                    {isHidden ? 'CORTICAL COMMAND' : 'OPERATIONS BRIDGE'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isHidden ? 'Direct neural interface active.' : 'Global logistics oversight online.'}
                  </p>
               </div>
               <div className="flex-1 min-h-0">
                 <ThalassaInterface mode={mode} />
               </div>
            </div>

            {/* Col 2: Fleet/Network Status (The List) */}
            <div className="glass-panel rounded-xl flex flex-col h-full overflow-hidden min-h-0">
               <div className={`p-4 border-b ${isHidden ? 'border-purple-500/30 bg-purple-900/10' : 'border-sky-500/30 bg-sky-900/10'}`}>
                  <h3 className={`font-mono text-xs font-bold tracking-widest uppercase ${isHidden ? 'text-purple-300' : 'text-sky-300'}`}>
                    {isHidden ? 'ACTIVE NEUROTRANSMITTERS' : 'FLEET MANIFEST'}
                  </h3>
               </div>
               <div className="flex-1 overflow-y-auto p-2">
                  <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] uppercase text-slate-500 font-mono sticky top-0 bg-ocean-900/90 backdrop-blur z-10">
                      <tr>
                        <th className="p-3">{isHidden ? 'Molecule' : 'Vessel Name'}</th>
                        <th className="p-3">{isHidden ? 'Action' : 'Cargo'}</th>
                        <th className="p-3">{isHidden ? 'Signal' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {SHIPS_DATA.map(ship => {
                        const route = ROUTES.find(r => r.id === ship.routeId);
                        return (
                          <tr key={ship.id} className={`border-b border-slate-800/50 hover:bg-white/5 transition-colors ${isHidden ? 'hover:bg-purple-900/20' : ''}`}>
                            <td className={`p-3 font-bold ${isHidden ? 'text-purple-300' : 'text-slate-200'}`}>
                              {isHidden ? ship.neurotransmitter : ship.name}
                            </td>
                            <td className="p-3 text-slate-400">
                               {isHidden ? 'EXCITATORY' : ship.cargoType}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-[10px] border ${
                                route?.status === 'optimal' 
                                  ? (isHidden ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10')
                                  : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                              }`}>
                                {isHidden ? (route?.status === 'optimal' ? 'FLOW' : 'BLOCK') : route?.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  
                  {/* Additional "Hidden" data rows to fill space */}
                   <div className="mt-6 px-3">
                      <h4 className={`text-[10px] font-bold mb-2 uppercase ${isHidden ? 'text-slate-600' : 'text-slate-600'}`}>
                        {isHidden ? 'Synaptic Hub Status' : 'Port Congestion Index'}
                      </h4>
                      <div className="space-y-2">
                        {PORTS.slice(0,4).map(port => (
                          <div key={port.id} className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">{port.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${isHidden ? 'bg-purple-500' : 'bg-sky-500'}`} 
                                  style={{ width: `${isHidden ? port.neuralActivity : port.congestionLevel}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-right text-slate-500">{isHidden ? port.neuralActivity : port.congestionLevel}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
               </div>
            </div>

            {/* Col 3: Metrics */}
            <div className="flex flex-col h-full min-h-0">
               <div className="flex-1 min-h-0">
                   <MetricsPanel mode={mode} />
               </div>
            </div>

          </div>
        )}

        {/* MAP VIEW */}
        {page === Page.MAP && (
          <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl animate-in zoom-in-95 duration-500 relative">
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