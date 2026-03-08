/**
 * Real-time Oil Price Data Utility
 * Generates realistic WTI Crude Oil price data with risk correlation
 */

export interface RiskOilDataPoint {
  time: string;
  risk: number;
  oilPrice: number;
  timestamp: number;
}

// Base WTI Crude Oil price (realistic 2026 average)
const BASE_OIL_PRICE = 78.5;

// Global state to maintain continuity across calls
let lastPrice = BASE_OIL_PRICE;
let lastRisk = 45;
let dataHistory: RiskOilDataPoint[] = [];

/**
 * Simulate real-time oil price movements
 * Based on: geopolitical risk, supply/demand, market sentiment
 */
export function generateRealTimeOilData(pointsCount: number = 6): RiskOilDataPoint[] {
  const now = new Date();
  const data: RiskOilDataPoint[] = [];
  
  // If we have no history, initialize it
  if (dataHistory.length === 0) {
    const startTime = new Date(now.getTime() - pointsCount * 30 * 60 * 1000); // 30 min intervals
    
    for (let i = 0; i < pointsCount; i++) {
      const time = new Date(startTime.getTime() + i * 30 * 60 * 1000);
      
      // Simulate realistic price movement
      const priceChange = (Math.random() - 0.5) * 2.5; // -$1.25 to +$1.25
      lastPrice = Math.max(65, Math.min(95, lastPrice + priceChange));
      
      // Risk correlates with price volatility and geopolitical factors
      const riskChange = (Math.random() - 0.5) * 8;
      lastRisk = Math.max(30, Math.min(85, lastRisk + riskChange));
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk: Math.round(lastRisk),
        oilPrice: parseFloat(lastPrice.toFixed(2)),
        timestamp: time.getTime()
      });
    }
    
    dataHistory = data;
    return data;
  }
  
  // Add new data point and shift old ones
  const lastPoint = dataHistory[dataHistory.length - 1];
  const newTime = new Date(lastPoint.timestamp + 30 * 60 * 1000);
  
  // More sophisticated price movement based on risk
  const riskFactor = (lastRisk - 50) / 50; // -1 to +1
  const trendFactor = Math.random() > 0.5 ? 1 : -1;
  const priceChange = (Math.random() * 1.5 + riskFactor * 0.8) * trendFactor;
  
  lastPrice = Math.max(65, Math.min(95, lastPrice + priceChange));
  
  // Risk responds to events and price volatility
  const volatility = Math.abs(priceChange);
  const riskChange = (Math.random() - 0.4) * 10 + volatility * 3;
  lastRisk = Math.max(30, Math.min(85, lastRisk + riskChange));
  
  const newPoint: RiskOilDataPoint = {
    time: newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    risk: Math.round(lastRisk),
    oilPrice: parseFloat(lastPrice.toFixed(2)),
    timestamp: newTime.getTime()
  };
  
  dataHistory.push(newPoint);
  if (dataHistory.length > pointsCount) {
    dataHistory.shift();
  }
  
  return [...dataHistory];
}

/**
 * Get current oil price
 */
export function getCurrentOilPrice(): number {
  return lastPrice;
}

/**
 * Get current risk level
 */
export function getCurrentRisk(): number {
  return lastRisk;
}

/**
 * Simulate major event impact on prices and risk
 */
export function simulateEventImpact(severity: 'low' | 'medium' | 'high') {
  const impacts = {
    low: { price: 2, risk: 5 },
    medium: { price: 5, risk: 15 },
    high: { price: 10, risk: 25 }
  };
  
  const impact = impacts[severity];
  lastPrice += impact.price;
  lastRisk = Math.min(95, lastRisk + impact.risk);
}

/**
 * Reset to base values (for testing)
 */
export function resetOilData() {
  lastPrice = BASE_OIL_PRICE;
  lastRisk = 45;
  dataHistory = [];
}

/**
 * Fetch real oil price from public API (fallback to simulated data)
 * Free APIs: Alpha Vantage, Twelve Data, etc.
 */
export async function fetchRealOilPrice(): Promise<{ price: number; timestamp: Date } | null> {
  try {
    // Note: In production, you could use:
    // - Alpha Vantage: https://www.alphavantage.co/query?function=WTI&apikey=YOUR_KEY
    // - Twelve Data: https://api.twelvedata.com/quote?symbol=USOIL&apikey=YOUR_KEY
    // - EODHD: https://eodhistoricaldata.com/api/real-time/USOIL.CC?api_token=YOUR_KEY
    
    // For now, return simulated real-time data
    return {
      price: getCurrentOilPrice(),
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Failed to fetch real oil price:', error);
    return null;
  }
}
