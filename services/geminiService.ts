import { GoogleGenAI } from "@google/genai";
import { EconomicScenario, SimulationResult } from "../utils/economics";

export const analyzeScenarios = async (
  scenarioA: EconomicScenario,
  resultA: SimulationResult,
  scenarioB: EconomicScenario,
  resultB: SimulationResult
): Promise<string> => {
  // Guard clause if API key is missing
  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Please ensure process.env.API_KEY is set.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as an economics professor. Compare these two government subsidy scenarios.
    
    Baseline Equilibrium: Price = 10, Quantity = 100.

    Scenario A:
    - PED (Demand Elasticity): ${scenarioA.ped}
    - PES (Supply Elasticity): ${scenarioA.pes}
    - Subsidy Amount: $${scenarioA.subsidy}
    - Resulting Gov Expenditure: $${resultA.govExpenditure.toFixed(2)}
    - New Quantity: ${resultA.Q_new.toFixed(2)}
    - Consumer Price: $${resultA.P_consumer.toFixed(2)}

    Scenario B:
    - PED (Demand Elasticity): ${scenarioB.ped}
    - PES (Supply Elasticity): ${scenarioB.pes}
    - Subsidy Amount: $${scenarioB.subsidy}
    - Resulting Gov Expenditure: $${resultB.govExpenditure.toFixed(2)}
    - New Quantity: ${resultB.Q_new.toFixed(2)}
    - Consumer Price: $${resultB.P_consumer.toFixed(2)}

    Task:
    1. Explain why the Government Expenditure differs between the two scenarios.
    2. Specifically discuss how the elasticity (PED/PES) affected the "area of change" (Expenditure).
    3. Keep it concise (max 150 words) and educational.
    4. Do not use markdown formatting for bold/italic, just plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate analysis. Please try again later.";
  }
};