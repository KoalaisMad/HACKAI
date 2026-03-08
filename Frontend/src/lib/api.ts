"use client";

import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  SessionResponse,
  EventFeedResponse,
  CrisisBriefingResponse,
  ShippingStatusResponse,
  RiskOilChartResponse,
  MapDataResponse,
  PredictionSnapshot,
  Bet,
  ApiError,
} from "./api-types";

const TOKEN_KEY = "crisis_intel_token";

/**
 * Backend base URL. Set NEXT_PUBLIC_API_URL in .env to point to your backend.
 * If unset, API calls will fail (use mock/localStorage until backend is ready).
 */
export const API_BASE_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "";

export function isBackendConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: T | ApiError;
  try {
    data = text ? (JSON.parse(text) as T | ApiError) : ({} as T);
  } catch {
    throw { message: res.statusText || "Request failed", status: res.status };
  }
  if (!res.ok) {
    const err = data as ApiError;
    throw {
      message: err?.message || res.statusText || "Request failed",
      status: res.status,
      code: err?.code,
    };
  }
  return data as T;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  return handleResponse<T>(res);
}

// —— Auth ——

export const authApi = {
  async login(body: LoginRequest): Promise<LoginResponse> {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async signup(body: SignupRequest): Promise<SignupResponse> {
    return request<SignupResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async logout(): Promise<void> {
    try {
      await request("/api/auth/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
    }
  },

  async getSession(): Promise<SessionResponse | null> {
    const res = await fetch(`${API_BASE_URL}/api/auth/session`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 401) return null;
    return handleResponse<SessionResponse>(res);
  },
};

/** Call after login/signup to persist token for future requests. */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

// —— Dashboard (optional query params if your backend supports region/time) ——

export const eventsApi = {
  async getEventFeed(params?: {
    region?: string;
    from?: string;
    to?: string;
  }): Promise<EventFeedResponse> {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    const path = q ? `/api/events?${q}` : "/api/events";
    return request<EventFeedResponse>(path);
  },
};

export const crisisApi = {
  async getCrisisBriefing(params?: {
    region?: string;
  }): Promise<CrisisBriefingResponse> {
    const q = params?.region
      ? `?${new URLSearchParams({ region: params.region })}`
      : "";
    return request<CrisisBriefingResponse>(`/api/crisis/briefing${q}`);
  },
};

export const shippingApi = {
  async getShippingStatus(params?: {
    region?: string;
  }): Promise<ShippingStatusResponse> {
    const q = params?.region
      ? `?${new URLSearchParams({ region: params.region })}`
      : "";
    return request<ShippingStatusResponse>(`/api/shipping/status${q}`);
  },
};

export const chartsApi = {
  async getRiskOilTrend(params?: {
    region?: string;
    from?: string;
    to?: string;
  }): Promise<RiskOilChartResponse> {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    const path = q ? `/api/charts/risk-oil?${q}` : "/api/charts/risk-oil";
    return request<RiskOilChartResponse>(path);
  },
};

export const mapApi = {
  async getMapData(params?: {
    region?: string;
  }): Promise<MapDataResponse> {
    const q = params?.region
      ? `?${new URLSearchParams({ region: params.region })}`
      : "";
    return request<MapDataResponse>(`/api/map/data${q}`);
  },
};

export const solanaApi = {
  async createSnapshot(body: {
    predictions: { day: number; predictedPrice: number; confidence: number; blockHash?: string; timestamp?: number }[];
    blockHash: string;
  }): Promise<PredictionSnapshot> {
    return request<PredictionSnapshot>("/api/solana/snapshots", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getSnapshots(limit?: number): Promise<{ snapshots: PredictionSnapshot[] }> {
    const q = limit ? `?limit=${limit}` : "";
    return request<{ snapshots: PredictionSnapshot[] }>(`/api/solana/snapshots${q}`);
  },

  async getSnapshot(id: string): Promise<PredictionSnapshot> {
    return request<PredictionSnapshot>(`/api/solana/snapshots/${id}`);
  },

  async placeBet(body: {
    snapshotId: string;
    targetDay: number;
    betSide: "YES" | "NO";
    solAmount: number;
    walletAddress?: string;
  }): Promise<Bet> {
    return request<Bet>("/api/solana/bets", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getMyBets(): Promise<{ bets: Bet[] }> {
    return request<{ bets: Bet[] }>("/api/solana/bets");
  },
};

/** Single export for all backend endpoints. */
export const api = {
  auth: authApi,
  events: eventsApi,
  crisis: crisisApi,
  shipping: shippingApi,
  charts: chartsApi,
  map: mapApi,
  solana: solanaApi,
};
