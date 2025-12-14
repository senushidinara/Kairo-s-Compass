export interface Port {
  id: string;
  name: string;
  lat: number;
  lng: number; // Simplified coordinate for visualization
  congestionLevel: number; // 0-100
  neuralActivity: number; // 0-100, hidden metric
  type: 'synapse' | 'hub';
}

export interface Route {
  id: string;
  from: string;
  to: string;
  efficiency: number;
  path: [number, number][]; // Array of coordinates
  status: 'optimal' | 'rerouting' | 'delayed';
  neuralLabel: string; // e.g., "Default Mode Network"
}

export interface Ship {
  id: string;
  name: string;
  routeId: string;
  progress: number; // 0-1
  cargoType: string;
  neurotransmitter: string; // Hidden label
}

export interface SystemMetrics {
  fuelSavings: number; // 17-23%
  networkLatency: number;
  globalStress: number;
  remCycles: number;
}

export enum AppMode {
  SURFACE = 'SURFACE', // Logistics View
  HIDDEN = 'HIDDEN'    // Neuroscience View
}

export enum Page {
  DASHBOARD = 'DASHBOARD',
  MAP = 'MAP',
  COMMS = 'COMMS',
  METRICS = 'METRICS'
}