"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons in Next.js (Leaflet uses file paths that break)
const createCustomIcon = (color: string, icon: string) =>
  L.divIcon({
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:12px">${icon}</div>`,
    className: "custom-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const shipIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:10px;height:8px;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  className: "ship-marker",
  iconSize: [10, 8],
  iconAnchor: [5, 4],
});

const tankerIcon = L.divIcon({
  html: `<div style="background:#f97316;width:10px;height:8px;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  className: "ship-marker",
  iconSize: [10, 8],
  iconAnchor: [5, 4],
});

const positions = {
  straitOfHormuz: [26.5, 56.3] as [number, number],
  storm1: [28.2, 51.5] as [number, number],
  storm2: [25.8, 54.2] as [number, number],
  missileTest: [27.0, 53.0] as [number, number],
  ships: [
    [26.8, 55.9],
    [27.2, 56.1],
    [26.5, 55.5],
    [27.5, 55.2],
    [26.2, 56.5],
    [27.0, 55.8],
    [26.9, 56.0],
    [27.3, 55.6],
    [26.6, 56.2],
    [27.1, 55.4],
  ] as [number, number][],
};

export function MapView() {
  return (
    <MapContainer
      center={[26.8, 55.5]}
      zoom={6}
      className="h-full w-full rounded-lg z-0"
      style={{ background: "#0d1117" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Tanker Security Alert - Strait of Hormuz */}
      <Marker
        position={positions.straitOfHormuz}
        icon={createCustomIcon("rgba(239,68,68,0.9)", "🔥")}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Tanker Security Alert</div>
            <div className="mt-1 space-y-0.5 text-gray-700">
              <div>Location: Strait of Hormuz</div>
              <div>Risk Score: 82</div>
              <div>Confidence: 74%</div>
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Storm Alerts */}
      <Marker
        position={positions.storm1}
        icon={createCustomIcon("rgba(59,130,246,0.9)", "⚡")}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Storm Alert</div>
            <div className="mt-1 text-gray-700">Heavy weather expected</div>
          </div>
        </Popup>
      </Marker>
      <Marker
        position={positions.storm2}
        icon={createCustomIcon("rgba(59,130,246,0.9)", "⚡")}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Storm Alert</div>
            <div className="mt-1 text-gray-700">High winds in area</div>
          </div>
        </Popup>
      </Marker>

      {/* Missile Test */}
      <Marker
        position={positions.missileTest}
        icon={createCustomIcon("rgba(249,115,22,0.9)", "🔔")}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Missile Test</div>
            <div className="mt-1 text-gray-700">Military activity detected</div>
          </div>
        </Popup>
      </Marker>

      {/* Ship markers */}
      {positions.ships.map((pos, i) => (
        <Marker
          key={i}
          position={pos}
          icon={i < 3 ? tankerIcon : shipIcon}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                {i < 3 ? "Tanker" : "Cargo"} Vessel
              </div>
              <div className="mt-1 text-gray-700">ID: SHIP-{1000 + i}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
