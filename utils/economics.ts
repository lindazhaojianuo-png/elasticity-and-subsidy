export interface EconomicScenario {
  ped: number; // Absolute value of Price Elasticity of Demand
  pes: number; // Price Elasticity of Supply
  subsidy: number;
}

export interface SimulationResult {
  Q_old: number;
  P_old: number;
  Q_new: number;
  P_consumer: number;
  P_producer: number;
  govExpenditure: number;
  // We store inverse slope/intercepts for easier plotting: P = intercept + slope*Q
  dem_m: number; // Inverse Demand Slope (negative)
  dem_c: number; // Inverse Demand Intercept
  sup_m: number; // Inverse Supply Slope (positive)
  sup_c: number; // Inverse Supply Intercept
}

// Fixed baseline equilibrium for comparison
const BASE_P = 10;
const BASE_Q = 100;

export const calculateEconomics = (scenario: EconomicScenario): SimulationResult => {
  const { ped, pes, subsidy } = scenario;

  // 1. Calculate linear coefficients based on Point Elasticity Formula at (Q,P)
  // Standard Form: Q = a - bP (Demand), Q = c + dP (Supply)
  // Elasticity E = (dQ/dP) * (P/Q)
  // |PED| = b * (P/Q)  => b = |PED| * (Q/P)
  // PES = d * (P/Q)    => d = PES * (Q/P)

  // Prevent division by zero or extremely small slopes for computational stability
  const safePed = Math.max(0.01, ped);
  const safePes = Math.max(0.01, pes);

  const b = safePed * (BASE_Q / BASE_P); // Demand slope (dQ/dP magnitude)
  const d = safePes * (BASE_Q / BASE_P); // Supply slope (dQ/dP)

  // 2. Calculate Intercepts for Standard Form
  // Demand: Q = a - bP => a = Q + bP
  const a = BASE_Q + b * BASE_P;
  // Supply: Q = c + dP => c = Q - dP
  const c = BASE_Q - d * BASE_P;

  // 3. Calculate New Equilibrium with Subsidy (Per Unit)
  // A per-unit subsidy shifts the Supply curve vertically DOWN by the subsidy amount (or Right).
  // Inverse Demand: P = (a/b) - (1/b)Q
  // Inverse Old Supply: P = -(c/d) + (1/d)Q
  // Inverse New Supply: P = (-(c/d) + (1/d)Q) - Subsidy
  
  // Equating Demand and New Supply:
  // (a/b) - (1/b)Q = -(c/d) + (1/d)Q - S
  // (a/b) + (c/d) + S = (1/d + 1/b)Q
  // Q * ((b+d)/bd) = (ad + cb + Sbd) / bd
  // Q_new = (ad + cb + Sbd) / (b+d)
  
  const Q_new = (a * d + c * b + subsidy * b * d) / (b + d);

  // 4. Calculate Prices
  // Consumer pays the price on the Demand curve at Q_new
  // P_cons = (a - Q_new) / b
  const P_consumer = (a - Q_new) / b;

  // Producer receives Consumer Price + Subsidy
  const P_producer = P_consumer + subsidy;

  // 5. Gov Expenditure
  const govExpenditure = subsidy * Q_new;

  // 6. Prepare Inverse coefficients for easy plotting (P = dem_c + dem_m * Q)
  // Demand: P = (a/b) - (1/b)Q
  const dem_c = a / b;
  const dem_m = -1 / b;

  // Supply: P = -(c/d) + (1/d)Q
  const sup_c = -c / d;
  const sup_m = 1 / d;

  return {
    Q_old: BASE_Q,
    P_old: BASE_P,
    Q_new,
    P_consumer,
    P_producer,
    govExpenditure,
    dem_m,
    dem_c,
    sup_m,
    sup_c
  };
};

export const generateTrendData = (scenario: EconomicScenario, steps = 20) => {
  const maxSubsidy = 10; // Range to visualize
  const dataPoints = [];

  for (let i = 0; i <= steps; i++) {
    const s = (i / steps) * maxSubsidy;
    const res = calculateEconomics({ ...scenario, subsidy: s });
    dataPoints.push({
      subsidy: s,
      expenditure: res.govExpenditure,
      q_new: res.Q_new
    });
  }
  return dataPoints;
};
