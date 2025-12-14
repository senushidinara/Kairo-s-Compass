import React, { useEffect, useState, useRef } from 'react';
import { Port, Route, Ship, AppMode } from '../types';
import { PORTS, ROUTES, SHIPS_DATA } from '../constants';

interface NeuralMapProps {
  mode: AppMode;
}

const NeuralMap: React.FC<NeuralMapProps> = ({ mode }) => {
  const [ships, setShips] = useState<Ship[]>(
    SHIPS_DATA.map(s => ({ ...s, progress: Math.random() }))
  );
  
  const requestRef = useRef<number>(0);

  const animate = () => {
    setShips(prevShips => 
      prevShips.map(ship => {
        let newProgress = ship.progress + 0.002;
        if (newProgress > 1) newProgress = 0;
        return { ...ship, progress: newProgress };
      })
    );
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const getPointOnPath = (path: [number, number][], progress: number) => {
    const totalSegments = path.length - 1;
    const segmentIndex = Math.floor(progress * totalSegments);
    const segmentProgress = (progress * totalSegments) - segmentIndex;
    
    // Safety check
    if (segmentIndex >= path.length - 1) return path[path.length - 1];

    const [x1, y1] = path[segmentIndex];
    const [x2, y2] = path[segmentIndex + 1];

    // Simple Linear interpolation
    const x = x1 + (x2 - x1) * segmentProgress;
    const y = y1 + (y2 - y1) * segmentProgress;

    return [x, y];
  };

  const isHidden = mode === AppMode.HIDDEN;

  return (
    <div className={`relative w-full h-full overflow-hidden transition-colors duration-1000 ${isHidden ? 'bg-neural-900' : 'bg-ocean-900'}`}>
      {/* Background Grid / Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: `radial-gradient(${isHidden ? '#d946ef' : '#0ea5e9'} 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Routes */}
        {ROUTES.map((route) => {
            const d = `M ${route.path.map(p => p.join(',')).join(' L ')}`;
            return (
              <g key={route.id}>
                {/* Outer Glow for Hidden Mode */}
                {isHidden && (
                  <path 
                    d={d} 
                    fill="none" 
                    stroke="#d946ef" 
                    strokeWidth="1" 
                    strokeOpacity="0.3" 
                    filter="url(#glow)"
                  />
                )}
                {/* Main Path */}
                <path 
                  d={d} 
                  fill="none" 
                  stroke={isHidden ? '#f0abfc' : '#334155'} 
                  strokeWidth={isHidden ? 0.5 : 1} 
                  strokeOpacity={isHidden ? 0.6 : 1}
                  strokeDasharray={isHidden ? "1, 2" : "none"}
                />
              </g>
            );
        })}

        {/* Ports */}
        {PORTS.map((port) => (
          <g key={port.id} transform={`translate(${port.lng}, ${port.lat})`}>
            {isHidden && (
               <circle 
               r={port.neuralActivity / 20} 
               fill="#d946ef" 
               opacity="0.2"
               className="animate-pulse"
             />
            )}
            <circle 
              r={isHidden ? 1.5 : 2} 
              fill={isHidden ? '#e879f9' : (port.type === 'hub' ? '#fff' : '#94a3b8')} 
              className="transition-colors duration-500"
            />
            <text 
              y={5} 
              fontSize="3" 
              fill={isHidden ? '#f0abfc' : '#cbd5e1'} 
              textAnchor="middle" 
              className="font-mono pointer-events-none select-none opacity-80"
            >
              {port.name}
            </text>
            {isHidden && (
               <text 
               y={8} 
               fontSize="2" 
               fill="#d946ef" 
               textAnchor="middle" 
               className="font-mono opacity-60"
             >
               {Math.floor(port.neuralActivity)}Hz
             </text>
            )}
          </g>
        ))}

        {/* Ships / Neurotransmitters */}
        {ships.map((ship) => {
          const route = ROUTES.find(r => r.id === ship.routeId);
          if (!route) return null;
          const [x, y] = getPointOnPath(route.path, ship.progress);
          
          return (
            <g key={ship.id} transform={`translate(${x}, ${y})`}>
               <circle 
                r={isHidden ? 1.2 : 1.5} 
                fill={isHidden ? '#facc15' : '#38bdf8'}
                filter={isHidden ? "url(#glow)" : ""}
              />
              {isHidden && (
                 <circle r={2} fill="none" stroke="#facc15" strokeWidth="0.2" className="animate-ping opacity-50"/>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Overlay Information */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="font-mono text-xs text-slate-500">
           {isHidden ? "CEREBROSPINAL FLUID VELOCITY: 14.2 m/s" : "OCEAN CURRENT VELOCITY: 14.2 knots"}
           <br/>
           {isHidden ? "SYNAPTIC PLASTICITY: OPTIMAL" : "ROUTE EFFICIENCY: OPTIMAL"}
        </div>
      </div>
    </div>
  );
};

export default NeuralMap;