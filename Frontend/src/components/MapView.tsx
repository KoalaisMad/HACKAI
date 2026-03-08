"use client";

import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { mapApi, isBackendConfigured } from "@/lib/api";
import { HISTORICAL_EVENTS, type HistoricalEvent } from "@/lib/historicalEvents";

type MapViewProps = {
  selectedRegion: string;
  onHistoricalEventClick?: (event: HistoricalEvent) => void;
};

type MarkerType = "chokepoint" | "conflict" | "weather" | "shipping" | "historical";

type MarkerData = {
  position: [number, number];
  label: string;
  type: MarkerType;
  date?: string;
  severity?: "low" | "medium" | "high";
  description?: string;
  riskScore?: number;
  predictedOilMove?: number;
  historicalEvent?: HistoricalEvent;
};

type RegionConfig = {
  center: [number, number];
  zoom: number;
  markers: MarkerData[];
};

const REGION_CONFIG: Record<string, RegionConfig> = {
  "Strait of Hormuz": {
    center: [26.566, 56.25],
    zoom: 7,
    markers: [
      {
        position: [26.566, 56.25],
        label: "Strait of Hormuz",
        type: "chokepoint",
        description: "Primary maritime chokepoint for Gulf oil transit.",
      },
      {
        position: [26.24, 56.37],
        label: "Missile Threat Alert",
        type: "conflict",
        date: "2 days ago",
        severity: "high",
        description: "Security escalation reported near shipping corridor.",
      },
      {
        position: [25.92, 56.08],
        label: "Marine Weather Alert",
        type: "weather",
        date: "1 day ago",
        severity: "medium",
        description: "Elevated marine weather risk near the corridor.",
      },
      {
        position: [25.78, 55.92],
        label: "Tanker Reroute Cluster",
        type: "shipping",
        date: "Today",
        severity: "medium",
        description: "Observed rerouting and slowdown in vessel traffic.",
      },
    ],
  },

  "Bab el-Mandeb": {
    center: [12.7, 43.3],
    zoom: 7,
    markers: [
      {
        position: [12.7, 43.3],
        label: "Bab el-Mandeb",
        type: "chokepoint",
        description: "Strategic Red Sea shipping chokepoint.",
      },
      {
        position: [12.52, 43.42],
        label: "Strike Report",
        type: "conflict",
        date: "3 days ago",
        severity: "high",
        description: "Regional conflict signal affecting shipping route confidence.",
      },
      {
        position: [12.82, 43.18],
        label: "Shipping Congestion",
        type: "shipping",
        date: "Today",
        severity: "medium",
        description: "Traffic density and slower vessel movement detected.",
      },
      {
        position: [12.61, 43.05],
        label: "Marine Weather Alert",
        type: "weather",
        date: "1 day ago",
        severity: "low",
        description: "Weather-driven operational caution.",
      },
    ],
  },

  "Suez Canal": {
    center: [30.7, 32.35],
    zoom: 7,
    markers: [
      {
        position: [30.7, 32.35],
        label: "Suez Canal",
        type: "chokepoint",
        description: "Major Europe-Asia maritime corridor.",
      },
      {
        position: [30.42, 32.32],
        label: "Transit Delay Zone",
        type: "shipping",
        date: "Today",
        severity: "medium",
        description: "Reduced throughput and increased waiting time.",
      },
      {
        position: [30.92, 32.5],
        label: "Weather Advisory",
        type: "weather",
        date: "2 days ago",
        severity: "low",
        description: "Visibility concerns near transit route.",
      },
    ],
  },

  "Panama Canal": {
    center: [9.08, -79.68],
    zoom: 8,
    markers: [
      {
        position: [9.08, -79.68],
        label: "Panama Canal",
        type: "chokepoint",
        description: "Atlantic-Pacific strategic canal route.",
      },
      {
        position: [9.18, -79.86],
        label: "Queue / Delay Area",
        type: "shipping",
        date: "Today",
        severity: "medium",
        description: "Transit delays and queue buildup reported.",
      },
      {
        position: [9.03, -79.55],
        label: "Weather Disturbance",
        type: "weather",
        date: "1 day ago",
        severity: "medium",
        description: "Localized weather affecting canal operations.",
      },
    ],
  },

  "Strait of Malacca": {
    center: [2.5, 101.0],
    zoom: 7,
    markers: [
      {
        position: [2.5, 101.0],
        label: "Strait of Malacca",
        type: "chokepoint",
        description: "High-volume maritime trade corridor in Southeast Asia.",
      },
      {
        position: [2.89, 100.71],
        label: "Congestion Area",
        type: "shipping",
        date: "Today",
        severity: "medium",
        description: "High traffic density and vessel slowdown.",
      },
      {
        position: [2.22, 101.22],
        label: "Storm Risk Signal",
        type: "weather",
        date: "2 days ago",
        severity: "medium",
        description: "Weather conditions increasing route risk.",
      },
    ],
  },

  "Turkish Straits": {
    center: [41.2, 29.1],
    zoom: 8,
    markers: [
      {
        position: [41.2, 29.1],
        label: "Bosporus",
        type: "chokepoint",
        description: "Critical passage linking the Black Sea and Mediterranean.",
      },
      {
        position: [41.08, 29.02],
        label: "Transit Risk Zone",
        type: "shipping",
        date: "Today",
        severity: "low",
        description: "Moderate congestion and constrained transit movement.",
      },
      {
        position: [41.28, 29.18],
        label: "Weather Warning",
        type: "weather",
        date: "1 day ago",
        severity: "low",
        description: "Localized marine conditions affecting navigation.",
      },
    ],
  },
};

function getMarkerIcon(type: MarkerType): DivIcon {
  const config = {
    chokepoint: { color: "#3b82f6", symbol: "●" },
    conflict: { color: "#ef4444", symbol: "✦" },
    weather: { color: "#f59e0b", symbol: "☁" },
    shipping: { color: "#22c55e", symbol: "■" },
    historical: { color: "#a855f7", symbol: "📅" },
  }[type];

  return L.divIcon({
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        background: ${config.color};
        border: 2px solid white;
        box-shadow: 0 0 12px ${config.color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">
        ${config.symbol}
      </div>
    `,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

const FILTERS: Array<"all" | MarkerType> = [
  "all",
  "conflict",
  "weather",
  "shipping",
  "historical",
];

// Single overall weather overlay layer
const WEATHER_OVERLAY_URL = `https://maps.openweathermap.org/maps/2.0/weather/PA0/{z}/{x}/{y}?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;

export function MapView({ selectedRegion, onHistoricalEventClick }: MapViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | MarkerType>("all");
  const [weatherOverlayOn, setWeatherOverlayOn] = useState(false);
  const [realtimeMarkers, setRealtimeMarkers] = useState<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const config =
    REGION_CONFIG[selectedRegion] ?? REGION_CONFIG["Strait of Hormuz"];

  // Filter historical events for current region
  const historicalMarkers: MarkerData[] = useMemo(() => {
    return HISTORICAL_EVENTS
      .filter(event => event.region === selectedRegion)
      .map(event => ({
        position: event.position,
        label: event.title,
        type: "historical" as MarkerType,
        date: `${event.year} (Historical)`,
        severity: event.severity,
        description: event.description,
        riskScore: event.originalRiskScore,
        predictedOilMove: event.originalOilPriceChange,
        historicalEvent: event,
      }));
  }, [selectedRegion]);

  // Fetch real-time markers from backend
  useEffect(() => {
    if (!isBackendConfigured()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    mapApi
      .getMapData({ region: selectedRegion })
      .then((res) => {
        if (res.markers && Array.isArray(res.markers)) {
          setRealtimeMarkers(res.markers as MarkerData[]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch map data:", err);
        setIsLoading(false);
      });
  }, [selectedRegion]);

  // Combine static chokepoint markers with real-time event markers and historical events
  const allMarkers = useMemo(() => {
    return [...config.markers, ...realtimeMarkers, ...historicalMarkers];
  }, [config.markers, realtimeMarkers, historicalMarkers]);

  const visibleMarkers = useMemo(() => {
    if (activeFilter === "all") return allMarkers;
    return allMarkers.filter((marker) => marker.type === activeFilter);
  }, [allMarkers, activeFilter]);

  const hasWeatherKey = Boolean(process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY);

  return (
    <div className="relative h-full w-full">
      {/* Marker filters */}
      <div className="absolute left-3 top-3 z-[1000] flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm transition ${isActive
                  ? "border-[var(--accent-blue)] bg-[var(--accent-blue)] text-white"
                  : "border-white/10 bg-black/50 text-white/80 hover:bg-black/70"
                }`}
            >
              {filter === "all"
                ? "All"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Weather toggle */}
      <div className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-xl border border-white/10 bg-black/65 px-3 py-2 text-xs text-white/85 backdrop-blur-sm">
        <span className="font-medium text-white">Weather Overlay</span>
        <button
          type="button"
          onClick={() => setWeatherOverlayOn((prev) => !prev)}
          className={`rounded-full px-3 py-1 font-medium transition ${weatherOverlayOn
              ? "bg-[var(--accent-blue)] text-white"
              : "bg-white/10 text-white/80"
            }`}
        >
          {weatherOverlayOn ? "On" : "Off"}
        </button>
      </div>

      {/* Status badge */}
      <div className="absolute bottom-3 right-3 z-[1000] rounded-full border border-white/10 bg-black/65 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-spin rounded-full border border-white border-t-transparent" />
            Loading real-time data...
          </span>
        ) : (
          <span>
            {realtimeMarkers.length > 0 
              ? `${realtimeMarkers.length} real-time events` 
              : "Static data only"}
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-xl border border-white/10 bg-black/65 px-3 py-2 text-xs text-white/85 backdrop-blur-sm">
        <div className="mb-2 font-semibold text-white">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Chokepoint
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Conflict
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Weather
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            Shipping
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            Historical Event
          </div>
        </div>
      </div>

      <MapContainer
        key={`${selectedRegion}-${activeFilter}-${weatherOverlayOn}`}
        center={config.center}
        zoom={config.zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ position: "relative", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        {weatherOverlayOn && hasWeatherKey ? (
          <TileLayer
            url={WEATHER_OVERLAY_URL}
            opacity={0.42}
            attribution="&copy; OpenWeather"
          />
        ) : null}

        {visibleMarkers.map((marker) => (
          <Marker
            key={`${marker.label}-${marker.position[0]}-${marker.position[1]}`}
            position={marker.position}
            icon={getMarkerIcon(marker.type)}
            eventHandlers={
              marker.historicalEvent && onHistoricalEventClick
                ? {
                    click: () => {
                      onHistoricalEventClick(marker.historicalEvent!);
                    },
                  }
                : undefined
            }
          >
            <Popup>
              <div className="min-w-[180px] space-y-2">
                <div className="text-sm font-semibold">{marker.label}</div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {marker.type}
                </div>
                {marker.date ? (
                  <div className="text-xs text-gray-600">Date: {marker.date}</div>
                ) : null}
                {marker.severity ? (
                  <div className="text-xs text-gray-600">
                    Severity: {marker.severity}
                  </div>
                ) : null}
                {marker.riskScore ? (
                  <div className="text-xs text-gray-600">
                    Risk Score: {marker.riskScore}/100
                  </div>
                ) : null}
                {marker.predictedOilMove ? (
                  <div className="text-xs text-gray-600">
                    Oil Price Impact: +{marker.predictedOilMove}%
                  </div>
                ) : null}
                {marker.description ? (
                  <div className="text-xs text-gray-700">
                    {marker.description}
                  </div>
                ) : null}
                {marker.historicalEvent && (
                  <button
                    onClick={() => onHistoricalEventClick?.(marker.historicalEvent!)}
                    className="mt-2 w-full rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white hover:bg-purple-700"
                  >
                    Analyze Current Impact
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
