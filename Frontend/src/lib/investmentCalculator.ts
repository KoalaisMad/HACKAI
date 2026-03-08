/**
 * Investment Calculator
 * Compares ROI between oil and clean energy investments
 */

export interface InvestmentScenario {
  name: string;
  initialInvestment: number;
  projectedValue: number;
  roi: number;
  roiPercentage: number;
  timeHorizon: number; // days
  riskLevel: "Low" | "Medium" | "High";
  volatility: number;
}

export interface InvestmentComparison {
  oil: InvestmentScenario;
  cleanEnergy: InvestmentScenario;
  difference: number;
  differencePercentage: number;
  recommendation: "oil" | "cleanEnergy" | "diversify";
}

/**
 * Calculate investment projections for oil
 * Based on predicted oil price movements and market conditions
 */
export function calculateOilInvestment(
  investmentAmount: number,
  currentOilPrice: number = 78.5,
  predictedOilPrice: number = 82.3,
  timeHorizon: number = 30
): InvestmentScenario {
  // Calculate ROI based on oil price change
  const priceChangePercent = ((predictedOilPrice - currentOilPrice) / currentOilPrice) * 100;
  
  // Oil investments typically have 0.8-1.2x leverage to oil price movements
  const leverageFactor = 0.95 + Math.random() * 0.25;
  const roiPercentage = priceChangePercent * leverageFactor;
  
  // Add dividend yield (oil companies typically pay 3-5% annually)
  const annualDividendYield = 4.2;
  const dividendContribution = (annualDividendYield / 365) * timeHorizon;
  
  const totalRoiPercentage = roiPercentage + dividendContribution;
  const projectedValue = investmentAmount * (1 + totalRoiPercentage / 100);
  const roi = projectedValue - investmentAmount;

  return {
    name: "Oil & Gas ETF",
    initialInvestment: investmentAmount,
    projectedValue: parseFloat(projectedValue.toFixed(2)),
    roi: parseFloat(roi.toFixed(2)),
    roiPercentage: parseFloat(totalRoiPercentage.toFixed(2)),
    timeHorizon,
    riskLevel: "Medium",
    volatility: 15.5, // Annualized volatility %
  };
}

/**
 * Calculate investment projections for clean energy
 * Based on clean energy growth trends and market adoption
 */
export function calculateCleanEnergyInvestment(
  investmentAmount: number,
  timeHorizon: number = 30
): InvestmentScenario {
  // Clean energy sector growth factors
  // Average annual growth: 8-12% in current market conditions
  const baseGrowthRate = 9.5 + Math.random() * 2.5; // 9.5-12% annualized
  
  // Convert to time horizon
  const dailyGrowthRate = baseGrowthRate / 365;
  const totalGrowthPercent = dailyGrowthRate * timeHorizon;
  
  // Add momentum from policy support and adoption
  const policyBoost = 1.5; // Current strong policy support
  const adoptionMomentum = 0.8; // Growing but moderate
  
  const momentumFactor = policyBoost + adoptionMomentum;
  const totalRoiPercentage = totalGrowthPercent * (1 + momentumFactor / 10);
  
  const projectedValue = investmentAmount * (1 + totalRoiPercentage / 100);
  const roi = projectedValue - investmentAmount;

  return {
    name: "Clean Energy ETF",
    initialInvestment: investmentAmount,
    projectedValue: parseFloat(projectedValue.toFixed(2)),
    roi: parseFloat(roi.toFixed(2)),
    roiPercentage: parseFloat(totalRoiPercentage.toFixed(2)),
    timeHorizon,
    riskLevel: "Medium",
    volatility: 22.5, // Higher volatility due to growth sector
  };
}

/**
 * Compare oil vs clean energy investment scenarios
 */
export function compareInvestments(
  investmentAmount: number,
  currentOilPrice: number = 78.5,
  predictedOilPrice: number = 82.3,
  timeHorizon: number = 30
): InvestmentComparison {
  const oil = calculateOilInvestment(investmentAmount, currentOilPrice, predictedOilPrice, timeHorizon);
  const cleanEnergy = calculateCleanEnergyInvestment(investmentAmount, timeHorizon);

  const difference = cleanEnergy.roi - oil.roi;
  const differencePercentage = ((difference / investmentAmount) * 100);

  // Determine recommendation based on various factors
  let recommendation: "oil" | "cleanEnergy" | "diversify";
  
  const roiDiff = Math.abs(cleanEnergy.roiPercentage - oil.roiPercentage);
  
  if (roiDiff < 2) {
    // Very similar returns - recommend diversification
    recommendation = "diversify";
  } else if (cleanEnergy.roiPercentage > oil.roiPercentage + 1) {
    // Clean energy significantly better
    recommendation = "cleanEnergy";
  } else if (oil.roiPercentage > cleanEnergy.roiPercentage + 1) {
    // Oil significantly better
    recommendation = "oil";
  } else {
    // Close call - diversify
    recommendation = "diversify";
  }

  return {
    oil,
    cleanEnergy,
    difference: parseFloat(difference.toFixed(2)),
    differencePercentage: parseFloat(differencePercentage.toFixed(2)),
    recommendation,
  };
}

/**
 * Calculate diversified portfolio (50/50 split)
 */
export function calculateDiversifiedPortfolio(
  investmentAmount: number,
  currentOilPrice: number = 78.5,
  predictedOilPrice: number = 82.3,
  timeHorizon: number = 30
): InvestmentScenario {
  const halfAmount = investmentAmount / 2;
  
  const oil = calculateOilInvestment(halfAmount, currentOilPrice, predictedOilPrice, timeHorizon);
  const cleanEnergy = calculateCleanEnergyInvestment(halfAmount, timeHorizon);
  
  const totalProjectedValue = oil.projectedValue + cleanEnergy.projectedValue;
  const totalRoi = totalProjectedValue - investmentAmount;
  const totalRoiPercentage = (totalRoi / investmentAmount) * 100;
  
  // Diversification reduces overall volatility
  const combinedVolatility = Math.sqrt(
    (oil.volatility ** 2 + cleanEnergy.volatility ** 2) / 2
  ) * 0.85; // Correlation benefit

  return {
    name: "Diversified Portfolio (50/50)",
    initialInvestment: investmentAmount,
    projectedValue: parseFloat(totalProjectedValue.toFixed(2)),
    roi: parseFloat(totalRoi.toFixed(2)),
    roiPercentage: parseFloat(totalRoiPercentage.toFixed(2)),
    timeHorizon,
    riskLevel: "Low",
    volatility: parseFloat(combinedVolatility.toFixed(2)),
  };
}

/**
 * Generate multiple time horizon projections
 */
export function generateTimeHorizonProjections(
  investmentAmount: number,
  currentOilPrice: number = 78.5,
  predictedOilPrice: number = 82.3
): Array<{ days: number; oil: number; cleanEnergy: number; diversified: number }> {
  const timeHorizons = [7, 14, 30, 60, 90, 180];
  
  return timeHorizons.map(days => {
    const oil = calculateOilInvestment(investmentAmount, currentOilPrice, predictedOilPrice, days);
    const cleanEnergy = calculateCleanEnergyInvestment(investmentAmount, days);
    const diversified = calculateDiversifiedPortfolio(investmentAmount, currentOilPrice, predictedOilPrice, days);
    
    return {
      days,
      oil: oil.projectedValue,
      cleanEnergy: cleanEnergy.projectedValue,
      diversified: diversified.projectedValue,
    };
  });
}
