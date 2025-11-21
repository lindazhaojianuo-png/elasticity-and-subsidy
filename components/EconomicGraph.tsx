import React from 'react';
import { SimulationResult } from '../utils/economics';

interface EconomicGraphProps {
  result: SimulationResult;
  width?: number;
  height?: number;
  label: string;
  subsidyAmount: number;
}

const EconomicGraph: React.FC<EconomicGraphProps> = ({ result, width = 400, height = 350, label, subsidyAmount }) => {
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Fixed Scales for visual consistency
  const maxP = 25;
  const maxQ = 250;

  const mapX = (q: number) => padding + (q / maxQ) * graphWidth;
  // SVG Y is inverted (0 is top), so we subtract from height
  const mapY = (p: number) => height - padding - (p / maxP) * graphHeight;

  const {
    Q_old, P_old, Q_new, P_consumer, P_producer,
    govExpenditure, dem_m, dem_c, sup_m, sup_c
  } = result;

  // Helper to generate line coordinates based on y = mx + c
  // We calculate P for Q=0 and Q=maxQ
  const getLineCoords = (m: number, c: number, shiftY = 0) => {
    const p1 = c + shiftY; 
    const p2 = (m * maxQ) + c + shiftY;
    return {
      x1: mapX(0),
      y1: mapY(p1),
      x2: mapX(maxQ),
      y2: mapY(p2)
    };
  };

  // Demand Curve: P = dem_c + dem_m * Q
  const dLine = getLineCoords(dem_m, dem_c);
  
  // Supply Curve (Old): P = sup_c + sup_m * Q
  const sLine = getLineCoords(sup_m, sup_c);

  // Supply Curve (New): Shifted DOWN vertically by subsidy amount
  // P_new = P_old - Subsidy
  const sNewLine = getLineCoords(sup_m, sup_c, -subsidyAmount);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
      <div className="flex justify-between w-full mb-2 items-end">
        <h3 className="font-bold text-slate-700 text-lg">{label}</h3>
        <span className="text-xs font-mono text-slate-400">P-Unit Sub: ${subsidyAmount.toFixed(2)}</span>
      </div>
      
      <div className="relative">
        <svg width={width} height={height} className="overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
          {/* Grid Lines (Optional visual aid) */}
          <line x1={padding} y1={mapY(10)} x2={width-padding} y2={mapY(10)} stroke="#e2e8f0" strokeDasharray="4" />
          <line x1={mapX(100)} y1={padding} x2={mapX(100)} y2={height-padding} stroke="#e2e8f0" strokeDasharray="4" />

          {/* Axes */}
          <line x1={padding} y1={height - padding} x2={width - padding/2} y2={height - padding} stroke="#cbd5e1" strokeWidth="2" />
          <line x1={padding} y1={height - padding} x2={padding} y2={padding/2} stroke="#cbd5e1" strokeWidth="2" />
          
          {/* Labels */}
          <text x={width - padding} y={height - padding + 15} className="text-xs fill-slate-500 font-bold">Qty</text>
          <text x={padding - 25} y={padding} className="text-xs fill-slate-500 font-bold">Price</text>
          <text x={padding - 15} y={height - padding} className="text-xs fill-slate-500">0</text>

          {/* EXPENDITURE AREA (Rectangle) */}
          {/* Defined by Q from 0 to Q_new, and vertical P from P_consumer to P_producer */}
          {/* Note: P_producer - P_consumer SHOULD equal Subsidy */}
          <rect
            x={mapX(0)}
            y={mapY(P_producer)} // Top Y (Higher Price)
            width={mapX(Q_new) - mapX(0)}
            height={mapY(P_consumer) - mapY(P_producer)} // Height is diff between Y coords
            fill="rgba(16, 185, 129, 0.15)"
            stroke="rgba(16, 185, 129, 0.5)"
            strokeWidth="1"
          />
          {/* Hatch pattern definition */}
          <defs>
            <pattern id={`hatch-${label}`} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
              <line x1="0" y="0" x2="0" y2="4" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect
            x={mapX(0)}
            y={mapY(P_producer)}
            width={mapX(Q_new) - mapX(0)}
            height={mapY(P_consumer) - mapY(P_producer)}
            fill={`url(#hatch-${label})`}
          />

          {/* Curves */}
          
          {/* Demand */}
          <line {...dLine} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          <text x={mapX(maxQ * 0.8)} y={mapY(dem_c + dem_m * (maxQ * 0.8)) - 10} fill="#3b82f6" className="text-xs font-bold">D</text>

          {/* Supply Old */}
          <line {...sLine} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <text x={mapX(maxQ * 0.8)} y={mapY(sup_c + sup_m * (maxQ * 0.8)) - 10} fill="#94a3b8" className="text-xs font-bold">S</text>

          {/* Supply New (Subsidy) */}
          <line {...sNewLine} stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" />
          <text x={mapX(maxQ * 0.9)} y={mapY(sup_c + sup_m * (maxQ * 0.9) - subsidyAmount) + 20} fill="#ef4444" className="text-xs font-bold">S+Sub</text>

          {/* Equilibrium Points */}
          {/* Base */}
          <circle cx={mapX(Q_old)} cy={mapY(P_old)} r="3" fill="#64748b" />
          
          {/* New Q Intersection on Demand (Consumer Price) */}
          <circle cx={mapX(Q_new)} cy={mapY(P_consumer)} r="4" fill="#3b82f6" stroke="white" strokeWidth="1" />
          
          {/* New Q Intersection on Old Supply (Producer Price) */}
          <circle cx={mapX(Q_new)} cy={mapY(P_producer)} r="4" fill="#ef4444" stroke="white" strokeWidth="1" />

          {/* Dropline for Q_new */}
          <line 
            x1={mapX(Q_new)} y1={mapY(P_producer)} 
            x2={mapX(Q_new)} y2={height - padding} 
            stroke="#64748b" strokeDasharray="3,3" 
            strokeWidth="1" 
          />

          {/* Price Labels on Axis */}
          <text x={padding - 35} y={mapY(P_producer) + 3} className="text-[10px] font-mono fill-emerald-600 font-bold">${P_producer.toFixed(1)}</text>
          <text x={padding - 35} y={mapY(P_consumer) + 3} className="text-[10px] font-mono fill-blue-600 font-bold">${P_consumer.toFixed(1)}</text>
          <text x={mapX(Q_new) - 10} y={height - padding + 15} className="text-[10px] font-mono fill-slate-700 font-bold">{Q_new.toFixed(0)}</text>
        </svg>
        
        {/* Tooltip-like overlay for area */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded border border-slate-200 text-xs shadow-sm">
          <div className="flex gap-2 items-center">
            <div className="w-3 h-3 bg-emerald-200/50 border border-emerald-500"></div>
            <span className="text-slate-600">Subsidy Cost</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-3 w-full px-4">
        <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Total Expenditure</div>
            <div className="text-2xl font-bold text-emerald-600">${govExpenditure.toFixed(2)}</div>
        </div>
        <div className="text-center border-l border-slate-100 pl-6">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Quantity Change</div>
            <div className="flex items-center gap-1 justify-center">
              <span className="text-slate-400 text-sm">{Q_old}</span>
              <span className="text-slate-300">→</span>
              <span className="text-lg font-semibold text-slate-800">{Q_new.toFixed(1)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicGraph;
