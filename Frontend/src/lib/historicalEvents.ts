/**
 * Historical events data for maritime incidents
 * These can be clicked to show how they would impact today's economy
 */

export interface HistoricalEvent {
  id: string;
  year: number;
  title: string;
  region: string;
  position: [number, number];
  description: string;
  originalRiskScore: number;
  originalOilPriceChange: number;
  severity: "low" | "medium" | "high";
  topFactors: string[];
  supplyChainDisruption: "Low" | "Low-Moderate" | "Moderate" | "High";
}

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: "2019-incident-2",
    year: 2019,
    title: "Incident 2: Maritime safety advisory issued for tanker fleets",
    region: "Strait of Hormuz",
    position: [26.3, 56.4],
    description: "Major maritime safety advisory issued affecting tanker operations in the Strait of Hormuz",
    originalRiskScore: 64,
    originalOilPriceChange: 4.6,
    severity: "high",
    topFactors: [
      "Multiple high-severity events detected",
      "Elevated regional tensions",
      "Supply chain vulnerabilities identified"
    ],
    supplyChainDisruption: "Moderate"
  },
  {
    id: "2019-incident-1",
    year: 2019,
    title: "Incident 1: Tanker attacks near Fujairah",
    region: "Strait of Hormuz",
    position: [25.1, 56.3],
    description: "Multiple tanker vessels damaged in coordinated attacks",
    originalRiskScore: 78,
    originalOilPriceChange: 6.2,
    severity: "high",
    topFactors: [
      "Direct attacks on critical infrastructure",
      "International security concerns",
      "Immediate impact on shipping routes"
    ],
    supplyChainDisruption: "High"
  },
  {
    id: "2020-strait-tension",
    year: 2020,
    title: "Heightened military presence in strait",
    region: "Strait of Hormuz",
    position: [26.6, 56.1],
    description: "Increased military activity led to insurance rate hikes and route diversions",
    originalRiskScore: 56,
    originalOilPriceChange: 3.2,
    severity: "medium",
    topFactors: [
      "Naval forces deployment increased",
      "Insurance premiums spiked",
      "Alternative routing considered"
    ],
    supplyChainDisruption: "Moderate"
  },
  {
    id: "2021-bab-blockade",
    year: 2021,
    title: "Temporary blockade threat",
    region: "Bab el-Mandeb",
    position: [12.65, 43.35],
    description: "Regional conflict created temporary blockade concerns",
    originalRiskScore: 72,
    originalOilPriceChange: 5.8,
    severity: "high",
    topFactors: [
      "Strategic chokepoint threatened",
      "Regional instability escalation",
      "Trade route uncertainty"
    ],
    supplyChainDisruption: "High"
  },
  {
    id: "2021-suez-blockage",
    year: 2021,
    title: "Ever Given Canal Blockage",
    region: "Suez Canal",
    position: [30.7, 32.35],
    description: "Container ship grounded, blocking canal for 6 days",
    originalRiskScore: 68,
    originalOilPriceChange: 4.9,
    severity: "high",
    topFactors: [
      "Complete canal blockage for extended period",
      "Global supply chain disruption",
      "Massive shipping delays"
    ],
    supplyChainDisruption: "High"
  },
  {
    id: "2023-panama-drought",
    year: 2023,
    title: "Severe drought reduces canal capacity",
    region: "Panama Canal",
    position: [9.08, -79.68],
    description: "Water levels dropped significantly, reducing daily transits",
    originalRiskScore: 52,
    originalOilPriceChange: 2.8,
    severity: "medium",
    topFactors: [
      "Climate-related operational constraints",
      "Reduced daily vessel capacity",
      "Extended waiting times"
    ],
    supplyChainDisruption: "Moderate"
  },
  {
    id: "2024-malacca-piracy",
    year: 2024,
    title: "Increased piracy incidents",
    region: "Strait of Malacca",
    position: [2.45, 101.15],
    description: "Series of piracy attempts increased security concerns",
    originalRiskScore: 48,
    originalOilPriceChange: 2.1,
    severity: "medium",
    topFactors: [
      "Maritime security incidents rising",
      "Insurance costs increased",
      "Enhanced security measures required"
    ],
    supplyChainDisruption: "Low-Moderate"
  },
  {
    id: "2020-turkish-closure",
    year: 2020,
    title: "Weather-related temporary closure",
    region: "Turkish Straits",
    position: [41.15, 29.05],
    description: "Severe weather forced temporary strait closure",
    originalRiskScore: 44,
    originalOilPriceChange: 1.8,
    severity: "medium",
    topFactors: [
      "Adverse weather conditions",
      "Safety-related transit suspension",
      "Temporary supply disruption"
    ],
    supplyChainDisruption: "Low-Moderate"
  },
  {
    id: "2016-hormuz-incident",
    year: 2016,
    title: "Naval confrontation near strait",
    region: "Strait of Hormuz",
    position: [26.2, 56.5],
    description: "Military vessels confrontation raised transit security concerns",
    originalRiskScore: 62,
    originalOilPriceChange: 4.1,
    severity: "high",
    topFactors: [
      "Naval forces standoff",
      "Heightened regional tensions",
      "Shipping insurance spikes"
    ],
    supplyChainDisruption: "Moderate"
  },
  {
    id: "2018-yemen-conflict",
    year: 2018,
    title: "Port facility attack",
    region: "Bab el-Mandeb",
    position: [12.8, 43.2],
    description: "Conflict escalation led to port facility damage and rerouting",
    originalRiskScore: 70,
    originalOilPriceChange: 5.3,
    severity: "high",
    topFactors: [
      "Critical infrastructure targeted",
      "Major shipping reroutes required",
      "Regional conflict spillover"
    ],
    supplyChainDisruption: "High"
  },
  {
    id: "2022-hormuz-seizure",
    year: 2022,
    title: "Tanker seizure incident",
    region: "Strait of Hormuz",
    position: [26.4, 56.3],
    description: "Commercial tanker detained, raising international tensions",
    originalRiskScore: 66,
    originalOilPriceChange: 4.8,
    severity: "high",
    topFactors: [
      "International law concerns",
      "Tanker fleet vulnerability exposed",
      "Diplomatic crisis triggered"
    ],
    supplyChainDisruption: "Moderate"
  },
  {
    id: "2017-malacca-collision",
    year: 2017,
    title: "Major vessel collision",
    region: "Strait of Malacca",
    position: [2.6, 101.05],
    description: "Two large vessels collided, blocking critical shipping lane",
    originalRiskScore: 54,
    originalOilPriceChange: 3.0,
    severity: "medium",
    topFactors: [
      "Navigation hazard created",
      "Temporary lane closure",
      "Regional traffic delays"
    ],
    supplyChainDisruption: "Moderate"
  },
  {
    id: "2015-suez-security",
    year: 2015,
    title: "Security alert disrupts transit",
    region: "Suez Canal",
    position: [30.5, 32.3],
    description: "Security threats led to enhanced screening and delays",
    originalRiskScore: 50,
    originalOilPriceChange: 2.6,
    severity: "medium",
    topFactors: [
      "Enhanced security protocols",
      "Transit time increases",
      "Operational cost rises"
    ],
    supplyChainDisruption: "Low-Moderate"
  },
  {
    id: "2014-bab-unstable",
    year: 2014,
    title: "Regional instability surge",
    region: "Bab el-Mandeb",
    position: [12.55, 43.4],
    description: "Political instability raised maritime security concerns",
    originalRiskScore: 58,
    originalOilPriceChange: 3.5,
    severity: "medium",
    topFactors: [
      "Political uncertainty",
      "Maritime patrol limitations",
      "Insurance rate adjustments"
    ],
    supplyChainDisruption: "Moderate"
  },
  {
    id: "2025-hormuz-drone",
    year: 2025,
    title: "Drone attack on cargo vessel",
    region: "Strait of Hormuz",
    position: [26.5, 56.2],
    description: "Unmanned aerial attack damaged commercial shipping vessel",
    originalRiskScore: 74,
    originalOilPriceChange: 5.7,
    severity: "high",
    topFactors: [
      "New attack vector demonstrated",
      "Technology-based threats emerging",
      "Defense measures reevaluated"
    ],
    supplyChainDisruption: "High"
  },
  {
    id: "2023-panama-congestion",
    year: 2023,
    title: "Record transit delays",
    region: "Panama Canal",
    position: [9.1, -79.7],
    description: "Extreme congestion created 3-week waiting times",
    originalRiskScore: 46,
    originalOilPriceChange: 2.3,
    severity: "medium",
    topFactors: [
      "Capacity constraints exceeded",
      "Alternative routes considered",
      "Shipping schedule disruptions"
    ],
    supplyChainDisruption: "Moderate"
  },
  {
    id: "2022-turkish-mines",
    year: 2022,
    title: "Naval mine discovery halts traffic",
    region: "Turkish Straits",
    position: [41.25, 29.15],
    description: "Drifting mines from regional conflict caused temporary closure",
    originalRiskScore: 60,
    originalOilPriceChange: 3.8,
    severity: "high",
    topFactors: [
      "Immediate safety threat",
      "Mine clearing operations required",
      "Regional conflict spillover effects"
    ],
    supplyChainDisruption: "High"
  },
  {
    id: "2019-suez-expansion",
    year: 2019,
    title: "Infrastructure upgrade delays",
    region: "Suez Canal",
    position: [30.6, 32.4],
    description: "Maintenance work reduced canal capacity temporarily",
    originalRiskScore: 38,
    originalOilPriceChange: 1.5,
    severity: "low",
    topFactors: [
      "Planned infrastructure work",
      "Reduced daily transits",
      "Minor scheduling impacts"
    ],
    supplyChainDisruption: "Low"
  },
  {
    id: "2024-malacca-storm",
    year: 2024,
    title: "Tropical cyclone disrupts shipping",
    region: "Strait of Malacca",
    position: [2.3, 101.2],
    description: "Severe weather event forced 48-hour shipping suspension",
    originalRiskScore: 42,
    originalOilPriceChange: 1.9,
    severity: "medium",
    topFactors: [
      "Weather-related closure",
      "Safety protocols enacted",
      "Regional traffic backlog"
    ],
    supplyChainDisruption: "Low-Moderate"
  },
  {
    id: "2016-bab-rescue",
    year: 2016,
    title: "Mass vessel distress event",
    region: "Bab el-Mandeb",
    position: [12.72, 43.25],
    description: "Multiple vessels required rescue operations, slowing traffic",
    originalRiskScore: 48,
    originalOilPriceChange: 2.4,
    severity: "medium",
    topFactors: [
      "Search and rescue operations",
      "Maritime safety concerns",
      "Transit slowdowns"
    ],
    supplyChainDisruption: "Low-Moderate"
  }
];

/**
 * Calculate how a historical event would impact today's economy
 * based on current market conditions
 */
export function calculateCurrentImpact(event: HistoricalEvent): {
  currentRiskScore: number;
  currentOilPriceChange: number;
  adjustmentFactors: string[];
} {
  // Simulate adjustment based on "current economy" conditions
  // In a real app, this would factor in actual current market data
  
  const volatilityMultiplier = 1.15; // Current market is more volatile
  const resilienceImprovement = 0.92; // Better supply chain resilience
  const geopoliticalTension = 1.08; // Current tensions are elevated
  
  const adjustedRisk = Math.min(
    100,
    Math.round(event.originalRiskScore * volatilityMultiplier * geopoliticalTension)
  );
  
  const adjustedOilChange = 
    event.originalOilPriceChange * volatilityMultiplier * resilienceImprovement * geopoliticalTension;
  
  const adjustmentFactors = [
    "Current market volatility (+15% risk)",
    "Improved supply chain resilience (-8% impact)",
    "Elevated geopolitical tensions (+8% risk)"
  ];
  
  return {
    currentRiskScore: adjustedRisk,
    currentOilPriceChange: Number(adjustedOilChange.toFixed(1)),
    adjustmentFactors
  };
}
