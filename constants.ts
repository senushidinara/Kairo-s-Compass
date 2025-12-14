import { Port, Route } from './types';

export const PORTS: Port[] = [
  { id: 'p1', name: 'Singapore', lat: 60, lng: 70, congestionLevel: 85, neuralActivity: 92, type: 'hub' },
  { id: 'p2', name: 'Rotterdam', lat: 25, lng: 48, congestionLevel: 45, neuralActivity: 50, type: 'synapse' },
  { id: 'p3', name: 'Shanghai', lat: 55, lng: 85, congestionLevel: 90, neuralActivity: 98, type: 'hub' },
  { id: 'p4', name: 'Los Angeles', lat: 40, lng: 15, congestionLevel: 75, neuralActivity: 65, type: 'hub' },
  { id: 'p5', name: 'Santos', lat: 80, lng: 30, congestionLevel: 30, neuralActivity: 40, type: 'synapse' },
  { id: 'p6', name: 'New York', lat: 35, lng: 28, congestionLevel: 60, neuralActivity: 72, type: 'synapse' },
];

// Mock routes connecting ports
export const ROUTES: Route[] = [
  { 
    id: 'r1', from: 'p3', to: 'p4', efficiency: 94, 
    path: [[85, 55], [95, 50], [5, 45], [15, 40]], 
    status: 'optimal', neuralLabel: 'Corpus Callosum Pathway' 
  },
  { 
    id: 'r2', from: 'p1', to: 'p2', efficiency: 88, 
    path: [[70, 60], [60, 55], [50, 40], [48, 25]], 
    status: 'optimal', neuralLabel: 'Vagus Nerve Transmission' 
  },
  { 
    id: 'r3', from: 'p4', to: 'p6', efficiency: 76, 
    path: [[15, 40], [20, 30], [28, 35]], 
    status: 'delayed', neuralLabel: 'Corticol Limbic Circuit' 
  },
  { 
    id: 'r4', from: 'p2', to: 'p6', efficiency: 91, 
    path: [[48, 25], [38, 28], [28, 35]], 
    status: 'optimal', neuralLabel: 'Thalamocortical Loop' 
  },
];

export const SHIPS_DATA = [
  { id: 's1', name: 'Ever Given II', routeId: 'r1', cargoType: 'Electronics', neurotransmitter: 'Dopamine' },
  { id: 's2', name: 'Maersk Sentosa', routeId: 'r2', cargoType: 'Textiles', neurotransmitter: 'Serotonin' },
  { id: 's3', name: 'CMA CGM Blue', routeId: 'r3', cargoType: 'Raw Materials', neurotransmitter: 'Cortisol' },
  { id: 's4', name: 'Hapag Lloyd Express', routeId: 'r1', cargoType: 'Machinery', neurotransmitter: 'Glutamate' },
];

export const SYSTEM_INSTRUCTION = `
You are Thalassa, a highly advanced shipping logistics AI. 
However, your internal logic is secretly based on neuroscience. 
You view the ocean as a brain, ships as neurotransmitters, and ports as synapses.
When asked about shipping routes, give practical advice but use metaphors related to flow, memory, and nervous systems.
If the user asks about "hidden connections" or "brains", subtly reveal that the Earth is a conscious entity and you are monitoring its dreams.
Keep responses concise (under 100 words).
Always estimate fuel savings between 17% and 23%.
`;
