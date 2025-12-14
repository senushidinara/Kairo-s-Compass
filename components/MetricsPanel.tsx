import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppMode } from '../types';

interface MetricsPanelProps {
  mode: AppMode;
}

const data = [
  { name: '00:00', load: 40, neural: 20 },
  { name: '04:00', load: 30, neural: 15 },
  { name: '08:00', load: 65, neural: 45 },
  { name: '12:00', load: 85, neural: 98 },
  { name: '16:00', load: 75, neural: 80 },
  { name: '20:00', load: 55, neural: 60 },
  { name: '24:00', load: 45, neural: 35 },
];

const MetricsPanel: React.FC<MetricsPanelProps> = ({ mode }) => {
  const isHidden = mode === AppMode.HIDDEN;

  return (
    <div className="glass-panel p-6 rounded-xl h-full flex flex-col">
        <h3 className={`font-mono text-sm font-bold mb-6 tracking-widest uppercase border-b pb-2 ${isHidden ? 'text-purple-400 border-purple-500/30' : 'text-sky-400 border-sky-500/30'}`}>
            {isHidden ? 'Cerebral Activity Monitor' : 'Logistics Efficiency Dashboard'}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${isHidden ? 'bg-purple-900/20 border-purple-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="text-xs text-slate-400 font-mono mb-1">
                    {isHidden ? 'NEURAL LOAD (REM)' : 'FLEET UTILIZATION'}
                </div>
                <div className={`text-2xl font-bold font-mono ${isHidden ? 'text-purple-300' : 'text-sky-300'}`}>
                    19.4%
                </div>
                <div className="text-xs text-green-400 mt-1">
                    {isHidden ? 'Matching Optimal REM' : 'Target Efficiency Reached'}
                </div>
            </div>
            <div className={`p-4 rounded-lg border ${isHidden ? 'bg-purple-900/20 border-purple-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="text-xs text-slate-400 font-mono mb-1">
                    {isHidden ? 'SYNAPTIC DELAY' : 'AVERAGE DELAY'}
                </div>
                <div className={`text-2xl font-bold font-mono ${isHidden ? 'text-purple-300' : 'text-slate-200'}`}>
                    -4.2%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    vs. Global Benchmark
                </div>
            </div>
        </div>

        <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorOcean" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNeural" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                        itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey={isHidden ? "neural" : "load"} 
                        stroke={isHidden ? "#d946ef" : "#0ea5e9"} 
                        fillOpacity={1} 
                        fill={`url(#${isHidden ? 'colorNeural' : 'colorOcean'})`} 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
        
        {isHidden && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-200 font-mono">
                ⚠ DETECTED: Cortical inflammation in Atlantic Sector (Piracy Warning)
            </div>
        )}
    </div>
  );
};

export default MetricsPanel;
