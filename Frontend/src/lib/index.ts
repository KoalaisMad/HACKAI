export {
  api,
  authApi,
  eventsApi,
  crisisApi,
  shippingApi,
  chartsApi,
  mapApi,
  API_BASE_URL,
  isBackendConfigured,
  setAuthToken,
} from "./api";
export type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  AuthUser,
  SessionResponse,
  EventItem,
  EventActivityPoint,
  EventFeedResponse,
  CrisisBriefingResponse,
  ShippingStatusResponse,
  RiskOilPoint,
  RiskOilChartResponse,
  MapAlert,
  MapShip,
  MapDataResponse,
  ApiError,
} from "./api-types";

export {
  parseOilPredictions,
  generateRealisticPredictions,
  formatPercentage,
  getPredictionSummary,
  predictionsToChartData,
} from "./oilPredictions";

export type { OilPrediction } from "./oilPredictions";

export {
  generateRealTimeOilData,
  getCurrentOilPrice,
  getCurrentRisk,
  simulateEventImpact,
  resetOilData,
  fetchRealOilPrice,
} from "./realTimeOilData";

export type { RiskOilDataPoint } from "./realTimeOilData";
