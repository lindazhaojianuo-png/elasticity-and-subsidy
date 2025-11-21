import React, { useState } from 'react';
import { EconomicScenario, SimulationResult, generateTrendData } from '../utils/economics';

interface ExpenditureAnalyticsProps {
  scenarioA: EconomicScenario;
  resultA: SimulationResult;
  scenarioB: EconomicScenario;
  resultB: SimulationResult;
}

const ExpenditureAnalytics: React.FC<ExpenditureAnalyticsProps> = ({ 
  scenarioA, resultA, scenarioB, resultB 
}) => {
  const [hoverData, setHoverData] = useState<{ x: number, y: number, value: string, title: string } | null>(null);

  // --- CHART 1: LINE CHART DATA PREP ---
  const trendA = generateTrendData(scenarioA);
  const trendB = generateTrendData(scenarioB);
  
  // Find max expenditure to scale the chart Y-axis
  const allExpenditures = [...trendA, ...trendB].map(d => d.expenditure);
  const maxExp = Math.max(...allExpenditures) * 1.1; // 10% padding
  const maxSub = 10; // Based on generateTrendData steps

  // Line Chart Dimensions
  const lHeight = 200;
  const lWidth = 500;
  const lPad = 40;
  
  const mapLX = (s: number) => lPad + (s / maxSub) * (lWidth - lPad * 2);
  const mapLY = (e: number) => lHeight - lPad - (e / maxExp) * (lHeight - lPad * 2);

  const createPath = (data: typeof trendA) => {
    return data.map((pt, i) => 
      `${i === 0 ? 'M' : 'L'} ${mapLX(pt.subsidy)} ${mapLY(pt.expenditure)}`
    ).join(' ');
  };

  // --- CHART 2: BAR CHART DATA PREP ---
  const bHeight = 200;
  const bWidth = 300;
  const bPad = 40;
  const barMax = Math.max(resultA.govExpenditure, resultB.govExpenditure) * 1.2;

  const barW = 60;
  const xA = bPad + 50;
  const xB = bPad + 150;
  
  const hA = (resultA.govExpenditure / barMax) * (bHeight - bPad * 2);
  const hB = (resultB.govExpenditure / barMax) * (bHeight - bPad * 2);
  const yA = bHeight - bPad - hA;
  const yB = bHeight - bPad - hB;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mt-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        </span>
        Comparative Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: CONTINUOUS IMPACT (Line) */}
        <div className="relative bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Expenditure Sensitivity</h3>
          <div className="relative overflow-hidden">
            <svg width="100%" height={lHeight} viewBox={`0 0 ${lWidth} ${lHeight}`} className="overflow-visible">
              {/* Axes */}
              <line x1={lPad} y1={lHeight - lPad} x2={lWidth - lPad} y2={lHeight - lPad} stroke="#cbd5e1" />
              <line x1={lPad} y1={lPad} x2={lPad} y2={lHeight - lPad} stroke="#cbd5e1" />
              
              {/* Labels */}
              <text x={lWidth/2} y={lHeight - 10} textAnchor="middle" className="text-[10px] fill-slate-400">Subsidy Amount ($)</text>
              <text x={10} y={lHeight/2} textAnchor="middle" transform={`rotate(-90, 10, ${lHeight/2})`} className="text-[10px] fill-slate-400">Gov Expenditure ($)</text>

              {/* Paths */}
              <path d={createPath(trendA)} fill="none" stroke="#3b82f6" strokeWidth="3" />
              <path d={createPath(trendB)} fill="none" stroke="#10b981" strokeWidth="3" />

              {/* Current Points Indicators */}
              <circle cx={mapLX(scenarioA.subsidy)} cy={mapLY(resultA.govExpenditure)} r="5" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <circle cx={mapLX(scenarioB.subsidy)} cy={mapLY(resultB.govExpenditure)} r="5" fill="white" stroke="#10b981" strokeWidth="2" />

              {/* Interaction Layer for Tooltips */}
              {trendA.map((pt, i) => (
                <rect 
                  key={`a-${i}`}
                  x={mapLX(pt.subsidy) - 5} 
                  y={0} 
                  width={10} 
                  height={lHeight} 
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverData({
                    x: mapLX(pt.subsidy),
                    y: mapLY(pt.expenditure),
                    title: `Scenario A (PED ${scenarioA.ped})`,
                    value: `$${pt.expenditure.toFixed(2)}`
                  })}
                  onMouseLeave={() => setHoverData(null)}
                />
              ))}
               {trendB.map((pt, i) => (
                <rect 
                  key={`b-${i}`}
                  x={mapLX(pt.subsidy) - 5} 
                  y={0} 
                  width={10} 
                  height={lHeight} 
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverData({
                    x: mapLX(pt.subsidy),
                    y: mapLY(pt.expenditure),
                    title: `Scenario B (PED ${scenarioB.ped})`,
                    value: `$${pt.expenditure.toFixed(2)}`
                  })}
                  onMouseLeave={() => setHoverData(null)}
                />
              ))}
            </svg>

            {/* Legend */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 text-xs bg-white/80 p-2 rounded border border-slate-100">
               <div className="flex items-center gap-2">
                 <span className="w-3 h-1 bg-blue-500 rounded"></span>
                 <span className="text-slate-600">Scenario A</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-3 h-1 bg-emerald-500 rounded"></span>
                 <span className="text-slate-600">Scenario B</span>
               </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Lines show how expenditure grows as subsidy increases for the chosen elasticities.</p>
        </div>

        {/* CHART 2: BAR CHART (Discrete Comparison) */}
        <div className="relative bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col items-center">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 w-full text-left">Direct Comparison</h3>
           <svg width={bWidth} height={bHeight} className="overflow-visible">
              <line x1={bPad} y1={bHeight - bPad} x2={bWidth - bPad} y2={bHeight - bPad} stroke="#cbd5e1" />
              
              {/* Bar A */}
              <rect 
                x={xA} y={yA} width={barW} height={hA} 
                fill="#3b82f6" rx="4" 
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverData({ x: xA + barW/2, y: yA, title: "Scenario A", value: `$${resultA.govExpenditure.toFixed(2)}` });
                }}
                onMouseLeave={() => setHoverData(null)}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
              <text x={xA + barW/2} y={bHeight - bPad + 20} textAnchor="middle" className="text-sm font-bold fill-slate-600">A</text>
              <text x={xA + barW/2} y={yA - 5} textAnchor="middle" className="text-xs font-bold fill-blue-600">${resultA.govExpenditure.toFixed(0)}</text>

              {/* Bar B */}
              <rect 
                x={xB} y={yB} width={barW} height={hB} 
                fill="#10b981" rx="4"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverData({ x: xB + barW/2, y: yB, title: "Scenario B", value: `$${resultB.govExpenditure.toFixed(2)}` });
                }}
                onMouseLeave={() => setHoverData(null)}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
               <text x={xB + barW/2} y={bHeight - bPad + 20} textAnchor="middle" className="text-sm font-bold fill-slate-600">B</text>
               <text x={xB + barW/2} y={yB - 5} textAnchor="middle" className="text-xs font-bold fill-emerald-600">${resultB.govExpenditure.toFixed(0)}</text>
           </svg>
           <p className="text-xs text-slate-400 mt-4 text-center w-full">Comparison of total government cost at current settings.</p>
        </div>

      </div>

      {/* Universal Tooltip */}
      {hoverData && (
        <div 
          className="absolute bg-slate-800 text-white text-xs rounded py-1 px-2 pointer-events-none shadow-xl z-50 transform -translate-x-1/2 -translate-y-full"
          style={{ left: 0, top: 0, marginLeft: hoverData.x, marginTop: hoverData.y + 24 }} // Simple offset logic, ideally relative to parent
        >
          <div className="font-bold">{hoverData.title}</div>
          <div>{hoverData.value}</div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default ExpenditureAnalytics;
