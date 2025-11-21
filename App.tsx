import React, { useState, useMemo } from 'react';
import EconomicGraph from './components/EconomicGraph';
import ControlPanel from './components/ControlPanel';
import ExpenditureAnalytics from './components/ExpenditureAnalytics';
import { calculateEconomics, EconomicScenario } from './utils/economics';
import { analyzeScenarios } from './services/geminiService';
import { RefreshCcw, BrainCircuit, TrendingUp, ArrowRight } from 'lucide-react';

function App() {
  // Initial States
  const [scenarioA, setScenarioA] = useState<EconomicScenario>({
    ped: 0.5, // Inelastic demand
    pes: 1.0, // Unit elastic supply
    subsidy: 3.0
  });

  const [scenarioB, setScenarioB] = useState<EconomicScenario>({
    ped: 2.0, // Elastic demand
    pes: 1.0, // Unit elastic supply
    subsidy: 3.0
  });

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derived Calculations
  const resultA = useMemo(() => calculateEconomics(scenarioA), [scenarioA]);
  const resultB = useMemo(() => calculateEconomics(scenarioB), [scenarioB]);

  // Handlers
  const handleChangeA = (key: keyof EconomicScenario, value: number) => {
    setScenarioA(prev => ({ ...prev, [key]: value }));
    setAnalysis(null); // Reset analysis when data changes
  };

  const handleChangeB = (key: keyof EconomicScenario, value: number) => {
    setScenarioB(prev => ({ ...prev, [key]: value }));
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    const text = await analyzeScenarios(scenarioA, resultA, scenarioB, resultB);
    setAnalysis(text);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Subsidy Impact Analyzer</h1>
                    <p className="text-xs text-slate-500">Interactive Economic Modeling</p>
                </div>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Reset"
            >
                <RefreshCcw size={20} />
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Compare Government Expenditure</h2>
            <p className="text-slate-600">
                Adjust the Price Elasticity of Demand (PED) and Supply (PES) in the two panels below to see how market responsiveness affects the total cost of a per-unit government subsidy.
            </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Panel A */}
            <div className="space-y-6">
                <ControlPanel 
                    title="Scenario A" 
                    scenario={scenarioA} 
                    onChange={handleChangeA}
                    colorClass="bg-white shadow-sm"
                />
                <EconomicGraph 
                  result={resultA} 
                  label="Market Model A" 
                  subsidyAmount={scenarioA.subsidy} 
                />
            </div>

            {/* Panel B */}
            <div className="space-y-6">
                <ControlPanel 
                    title="Scenario B" 
                    scenario={scenarioB} 
                    onChange={handleChangeB}
                    colorClass="bg-slate-50 shadow-inner"
                />
                <EconomicGraph 
                  result={resultB} 
                  label="Market Model B" 
                  subsidyAmount={scenarioB.subsidy} 
                />
            </div>
        </div>

        {/* New Analytics Component */}
        <div className="mb-12">
          <ExpenditureAnalytics 
            scenarioA={scenarioA} 
            resultA={resultA} 
            scenarioB={scenarioB} 
            resultB={resultB} 
          />
        </div>

        {/* Comparison Metrics Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                    <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-1">Spending Difference</div>
                    <div className="text-2xl font-bold">
                        {resultA.govExpenditure > resultB.govExpenditure ? (
                            <>Scenario A is <span className="text-emerald-400">+${(resultA.govExpenditure - resultB.govExpenditure).toFixed(2)}</span> higher</>
                        ) : (
                            <>Scenario B is <span className="text-emerald-400">+${(resultB.govExpenditure - resultA.govExpenditure).toFixed(2)}</span> higher</>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl">
                   <div className="text-right">
                        <div className="text-xs text-slate-400">Scenario A Total</div>
                        <div className="font-mono font-bold text-lg">${resultA.govExpenditure.toFixed(2)}</div>
                   </div>
                   <ArrowRight className="text-slate-500" />
                   <div className="text-left">
                        <div className="text-xs text-slate-400">Scenario B Total</div>
                        <div className="font-mono font-bold text-lg">${resultB.govExpenditure.toFixed(2)}</div>
                   </div>
                </div>

                <button 
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
                        ${isLoading 
                            ? 'bg-slate-700 text-slate-400 cursor-wait' 
                            : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-emerald-500/30'
                        }
                    `}
                >
                    <BrainCircuit size={20} />
                    {isLoading ? 'Analyzing...' : 'Explain Differences with AI'}
                </button>
            </div>
        </div>

        {/* AI Analysis Section */}
        {analysis && (
            <div className="bg-white border border-emerald-100 rounded-2xl p-8 shadow-lg animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                        <BrainCircuit size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Economic Insight</h3>
                </div>
                <div className="prose prose-slate max-w-none">
                    <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-line">
                        {analysis}
                    </p>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

export default App;
