import React from 'react';
import { EconomicScenario } from '../utils/economics';

interface ControlPanelProps {
  title: string;
  scenario: EconomicScenario;
  onChange: (key: keyof EconomicScenario, value: number) => void;
  colorClass?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ title, scenario, onChange, colorClass = "bg-slate-100" }) => {
  return (
    <div className={`p-6 rounded-xl ${colorClass} border border-slate-200`}>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        {title}
      </h2>
      
      <div className="space-y-5">
        {/* PED Control */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600">PED (Elasticity of Demand)</label>
            <span className="text-sm font-bold text-slate-900">{scenario.ped.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={scenario.ped}
            onChange={(e) => onChange('ped', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Inelastic (Vertical)</span>
            <span>Elastic (Flat)</span>
          </div>
        </div>

        {/* PES Control */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600">PES (Elasticity of Supply)</label>
            <span className="text-sm font-bold text-slate-900">{scenario.pes.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={scenario.pes}
            onChange={(e) => onChange('pes', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Inelastic</span>
            <span>Elastic</span>
          </div>
        </div>

        {/* Subsidy Control */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600">Subsidy ($)</label>
            <span className="text-sm font-bold text-emerald-600">${scenario.subsidy.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.5"
            value={scenario.subsidy}
            onChange={(e) => onChange('subsidy', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;