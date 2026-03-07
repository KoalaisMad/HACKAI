/**
 * Shared types for backend API request/response.
 * Align with your backend DTOs; adjust field names as needed.
 */

// —— Auth ——
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  country?: string;
}

export interface SignupResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
}

export interface AuthUser {
  email: string;
  name: string;
  country?: string;
}

export interface SessionResponse {
  user: AuthUser;
}

// —— Event Feed ——
export interface EventItem {
  id?: string;
  time: string;
  text: string;
  severity: "High" | "Med." | "Low";
}

export interface EventActivityPoint {
  time: string;
  value: number;
}

export interface EventFeedResponse {
  events: EventItem[];
  activityChart: EventActivityPoint[];
}

// —— Crisis Briefing ——
export interface CrisisBriefingResponse {
  event: string;
  riskScore: number;
  predictedImpact: {
    oilPriceChange: string;
    supplyChainDisruption: string;
  };
  topFactors: string[];
  audioBriefingUrl?: string;
}

// —— Shipping Status ——
export interface ShippingStatusResponse {
  tankersInRegion: number;
  avgSpeedKnots: number;
  reroutesDetected: number;
}

// —— Risk & Oil Price Chart ——
export interface RiskOilPoint {
  time: string;
  risk: number;
  oilPrice: number;
}

export interface RiskOilChartResponse {
  data: RiskOilPoint[];
  eventMarker?: { time: string; label: string };
}

// —— Map ——
export interface MapAlert {
  id: string;
  type: "security" | "storm" | "military";
  position: [number, number];
  label: string;
  description?: string;
  riskScore?: number;
  confidence?: number;
  icon?: string;
}

export interface MapShip {
  id: string;
  position: [number, number];
  type: "tanker" | "cargo";
}

export interface MapDataResponse {
  center: [number, number];
  zoom: number;
  alerts: MapAlert[];
  ships: MapShip[];
}

// —— Generic API error ——
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
